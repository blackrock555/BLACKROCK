"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, Button, Input, FileUpload, Alert } from "@/components/ui";
import {
  User,
  Lock,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Bell,
  Calendar,
  Loader2,
} from "lucide-react";
import { ProfileAvatarUpload } from "@/components/settings/ProfileAvatarUpload";
import { EmailVerificationSection } from "@/components/settings/EmailVerificationSection";
import { PasswordStrengthIndicator } from "@/components/settings/PasswordStrengthIndicator";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "kyc", label: "KYC Verification", icon: ShieldCheck },
];

interface PasswordStatus {
  hasPassword: boolean;
  lastPasswordChangeAt: string | null;
  lockoutRemaining: number;
  remainingAttempts: number;
  isLocked: boolean;
}

function SettingsPageContent() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "profile");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(null);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    depositApproved: true,
    withdrawalApproved: true,
    withdrawalRequested: true,
    profitShare: true,
    securityAlerts: true,
    marketingEmails: false,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // KYC state
  const [kycData, setKycData] = useState({
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    idType: "passport",
    idNumber: "",
  });
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const kycStatus = session?.user?.kycStatus || "NOT_SUBMITTED";
  const isEmailVerified = !!session?.user?.emailVerified;

  // Fetch user profile data
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
          setCountry(data.user.country || "");
          setUserImage(data.user.image || null);
          if (data.user.dateOfBirth) {
            const dob = new Date(data.user.dateOfBirth);
            setDateOfBirth(dob.toISOString().split("T")[0]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }, []);

  // Fetch password status
  const fetchPasswordStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/user/password");
      if (response.ok) {
        const data = await response.json();
        setPasswordStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch password status:", error);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchPasswordStatus();
    }
  }, [session, fetchProfile, fetchPasswordStatus]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const clearMessages = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleUpdateProfile = async () => {
    clearMessages();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, country, dateOfBirth }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Profile updated successfully");
        await update();
      } else {
        setErrorMessage(data.error || "Failed to update profile");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    clearMessages();

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        await fetchPasswordStatus();
      } else {
        setErrorMessage(data.error || "Failed to change password");
        if (data.remainingAttempts !== undefined) {
          setPasswordStatus((prev) =>
            prev ? { ...prev, remainingAttempts: data.remainingAttempts } : null
          );
        }
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    clearMessages();
    setNotificationsLoading(true);

    try {
      const response = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Notification preferences updated successfully");
      } else {
        setErrorMessage(data.error || "Failed to update notification preferences");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleSubmitKYC = async () => {
    clearMessages();

    if (!kycData.fullName || !kycData.dateOfBirth || !kycData.nationality || !kycData.address || !kycData.idNumber) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    if (!idFront || !selfie) {
      setErrorMessage("Please upload ID front and selfie documents");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", kycData.fullName);
      formData.append("dateOfBirth", kycData.dateOfBirth);
      formData.append("nationality", kycData.nationality);
      formData.append("address", kycData.address);
      formData.append("idType", kycData.idType);
      formData.append("idNumber", kycData.idNumber);
      formData.append("idFront", idFront);
      if (idBack) {
        formData.append("idBack", idBack);
      }
      formData.append("selfie", selfie);

      const response = await fetch("/api/kyc", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("KYC documents submitted successfully");
        await update();
      } else {
        setErrorMessage(data.error || "Failed to submit KYC");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (imageUrl: string | null) => {
    setUserImage(imageUrl);
    await update();
  };

  const handleEmailVerificationComplete = async () => {
    await update();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderKYCStatus = () => {
    switch (kycStatus) {
      case "APPROVED":
        return (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Verification Complete
            </h3>
            <p className="text-surface-400">
              Your identity has been verified. You have full access to all
              features including withdrawals.
            </p>
          </div>
        );
      case "PENDING":
        return (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Verification Pending
            </h3>
            <p className="text-surface-400">
              Your documents are being reviewed. This usually takes 1-24 hours.
              We&apos;ll notify you once the review is complete.
            </p>
          </div>
        );
      case "REJECTED":
        return (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Verification Rejected
            </h3>
            <p className="text-surface-400 mb-4">
              Your documents could not be verified. Please submit new documents
              with clearer images.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex justify-center pb-4 border-b border-surface-700">
              <ProfileAvatarUpload
                currentImage={userImage}
                name={name || session?.user?.name || ""}
                onUploadComplete={handleAvatarUpload}
              />
            </div>

            {/* Email Verification Section */}
            <EmailVerificationSection
              email={session?.user?.email || ""}
              isVerified={isEmailVerified}
              onVerificationComplete={handleEmailVerificationComplete}
            />

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="opacity-60"
              />
              <p className="text-surface-500 text-xs mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
              </div>
              <p className="text-surface-500 text-xs mt-1">
                You must be at least 18 years old
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Country
              </label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United States"
              />
            </div>

            <Button
              onClick={handleUpdateProfile}
              variant="primary"
              isLoading={isLoading}
              icon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            {/* Password Status Info */}
            {passwordStatus?.lastPasswordChangeAt && (
              <div className="bg-surface-800/50 border border-surface-700 rounded-lg p-4">
                <p className="text-surface-400 text-sm">
                  Last password change:{" "}
                  <span className="text-white">
                    {formatDate(passwordStatus.lastPasswordChangeAt)}
                  </span>
                </p>
              </div>
            )}

            {/* Lockout Warning */}
            {passwordStatus?.isLocked && (
              <Alert variant="error" icon={<Lock className="w-5 h-5" />}>
                Too many failed attempts. Please try again later.
              </Alert>
            )}

            {/* Remaining Attempts Warning */}
            {passwordStatus && !passwordStatus.isLocked && passwordStatus.remainingAttempts < 5 && (
              <Alert variant="warning" icon={<AlertTriangle className="w-5 h-5" />}>
                {passwordStatus.remainingAttempts} attempt{passwordStatus.remainingAttempts !== 1 ? "s" : ""} remaining before lockout
              </Alert>
            )}

            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={passwordStatus?.isLocked}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-300"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={passwordStatus?.isLocked}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-300"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  <PasswordStrengthIndicator password={newPassword} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={passwordStatus?.isLocked}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  onClick={handleChangePassword}
                  variant="primary"
                  isLoading={isLoading}
                  disabled={passwordStatus?.isLocked}
                  icon={<Lock className="w-4 h-4" />}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                Email Notifications
              </h3>
              <p className="text-surface-400 text-sm mb-6">
                Choose which emails you would like to receive
              </p>

              <div className="space-y-4">
                {/* Transaction Notifications */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-surface-300 uppercase tracking-wider">
                    Transactions
                  </h4>

                  <label className="flex items-center justify-between p-4 bg-surface-800/50 rounded-xl border border-surface-700 cursor-pointer hover:border-surface-600 transition-colors">
                    <div>
                      <span className="text-white font-medium">Deposit Approved</span>
                      <p className="text-surface-400 text-sm">Get notified when your deposit is approved</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, depositApproved: !prev.depositApproved }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications.depositApproved ? 'bg-brand-500' : 'bg-surface-600'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.depositApproved ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-surface-800/50 rounded-xl border border-surface-700 cursor-pointer hover:border-surface-600 transition-colors">
                    <div>
                      <span className="text-white font-medium">Withdrawal Approved</span>
                      <p className="text-surface-400 text-sm">Get notified when your withdrawal is processed</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, withdrawalApproved: !prev.withdrawalApproved }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications.withdrawalApproved ? 'bg-brand-500' : 'bg-surface-600'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.withdrawalApproved ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-surface-800/50 rounded-xl border border-surface-700 cursor-pointer hover:border-surface-600 transition-colors">
                    <div>
                      <span className="text-white font-medium">Withdrawal Requested</span>
                      <p className="text-surface-400 text-sm">Confirmation when you request a withdrawal</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, withdrawalRequested: !prev.withdrawalRequested }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications.withdrawalRequested ? 'bg-brand-500' : 'bg-surface-600'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.withdrawalRequested ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-surface-800/50 rounded-xl border border-surface-700 cursor-pointer hover:border-surface-600 transition-colors">
                    <div>
                      <span className="text-white font-medium">Profit Share</span>
                      <p className="text-surface-400 text-sm">Get notified when profits are distributed</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, profitShare: !prev.profitShare }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications.profitShare ? 'bg-brand-500' : 'bg-surface-600'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.profitShare ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                </div>

                {/* Security Notifications */}
                <div className="space-y-3 pt-4 border-t border-surface-700">
                  <h4 className="text-sm font-medium text-surface-300 uppercase tracking-wider">
                    Security
                  </h4>

                  <label className="flex items-center justify-between p-4 bg-surface-800/50 rounded-xl border border-surface-700 cursor-pointer hover:border-surface-600 transition-colors">
                    <div>
                      <span className="text-white font-medium">Security Alerts</span>
                      <p className="text-surface-400 text-sm">Login attempts and password changes</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, securityAlerts: !prev.securityAlerts }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications.securityAlerts ? 'bg-brand-500' : 'bg-surface-600'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.securityAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                </div>

                {/* Marketing */}
                <div className="space-y-3 pt-4 border-t border-surface-700">
                  <h4 className="text-sm font-medium text-surface-300 uppercase tracking-wider">
                    Marketing
                  </h4>

                  <label className="flex items-center justify-between p-4 bg-surface-800/50 rounded-xl border border-surface-700 cursor-pointer hover:border-surface-600 transition-colors">
                    <div>
                      <span className="text-white font-medium">Marketing Emails</span>
                      <p className="text-surface-400 text-sm">News, updates, and promotional offers</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications.marketingEmails ? 'bg-brand-500' : 'bg-surface-600'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleUpdateNotifications}
                variant="primary"
                isLoading={notificationsLoading}
                icon={<Save className="w-4 h-4" />}
                className="mt-6"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        );

      case "kyc":
        return (
          <div className="space-y-6">
            {/* KYC Status */}
            {renderKYCStatus()}

            {/* KYC Form (show if not approved or rejected) */}
            {(kycStatus === "NOT_SUBMITTED" || kycStatus === "REJECTED") && (
              <>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-200 mb-2">
                    Why verify your identity?
                  </h4>
                  <ul className="text-blue-200/80 text-sm space-y-1">
                    <li>Unlock withdrawal functionality</li>
                    <li>Increase account security</li>
                    <li>Access higher investment limits</li>
                    <li>Priority customer support</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Full Legal Name *
                    </label>
                    <Input
                      type="text"
                      value={kycData.fullName}
                      onChange={(e) =>
                        setKycData({ ...kycData, fullName: e.target.value })
                      }
                      placeholder="As shown on ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Date of Birth *
                    </label>
                    <Input
                      type="date"
                      value={kycData.dateOfBirth}
                      onChange={(e) =>
                        setKycData({ ...kycData, dateOfBirth: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Nationality *
                    </label>
                    <Input
                      type="text"
                      value={kycData.nationality}
                      onChange={(e) =>
                        setKycData({ ...kycData, nationality: e.target.value })
                      }
                      placeholder="e.g., United States"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Address *
                    </label>
                    <Input
                      type="text"
                      value={kycData.address}
                      onChange={(e) =>
                        setKycData({ ...kycData, address: e.target.value })
                      }
                      placeholder="Full address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      ID Type *
                    </label>
                    <select
                      value={kycData.idType}
                      onChange={(e) =>
                        setKycData({ ...kycData, idType: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg text-sm bg-surface-800 border border-surface-700 text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID Card</option>
                      <option value="drivers_license">Driver&apos;s License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      ID Number *
                    </label>
                    <Input
                      type="text"
                      value={kycData.idNumber}
                      onChange={(e) =>
                        setKycData({ ...kycData, idNumber: e.target.value })
                      }
                      placeholder="Enter your ID number"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-white">
                    Upload Documents
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        ID Front *
                      </label>
                      <FileUpload
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        onChange={(file) => setIdFront(file)}
                        value={idFront}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        ID Back <span className="text-surface-500">(Optional)</span>
                      </label>
                      <FileUpload
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        onChange={(file) => setIdBack(file)}
                        value={idBack}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Selfie with ID *
                      </label>
                      <FileUpload
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        onChange={(file) => setSelfie(file)}
                        value={selfie}
                      />
                    </div>
                  </div>

                  <p className="text-surface-500 text-sm">
                    Accepted formats: JPEG, PNG. Max file size: 5MB each.
                  </p>
                </div>

                <Button
                  onClick={handleSubmitKYC}
                  variant="primary"
                  isLoading={isLoading}
                  icon={<Upload className="w-4 h-4" />}
                >
                  Submit for Verification
                </Button>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-surface-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          clearMessages();
        }}
      >
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Messages */}
      {successMessage && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="error" icon={<AlertTriangle className="w-5 h-5" />}>
          {errorMessage}
        </Alert>
      )}

      {/* Tab Content */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
