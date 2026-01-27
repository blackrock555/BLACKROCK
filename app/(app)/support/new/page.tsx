"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardBody, Alert } from "@/components/ui";
import {
  MessageCircle,
  ArrowLeft,
  Send,
  AlertCircle,
} from "lucide-react";

const CATEGORIES = [
  { value: "GENERAL", label: "General Inquiry" },
  { value: "DEPOSIT", label: "Deposit Issue" },
  { value: "WITHDRAWAL", label: "Withdrawal Issue" },
  { value: "KYC", label: "KYC/Verification" },
  { value: "TECHNICAL", label: "Technical Support" },
  { value: "OTHER", label: "Other" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low", description: "General questions, no urgency" },
  { value: "MEDIUM", label: "Medium", description: "Standard request" },
  { value: "HIGH", label: "High", description: "Important issue affecting usage" },
  { value: "URGENT", label: "Urgent", description: "Critical issue, needs immediate attention" },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    category: "GENERAL",
    priority: "MEDIUM",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.subject.trim()) {
      setError("Please enter a subject");
      return;
    }

    if (!formData.message.trim()) {
      setError("Please enter a message");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create ticket");
      }

      router.push(`/support/${data.ticket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-brand-400" />
            New Support Ticket
          </h1>
          <p className="text-surface-400 mt-1">
            Describe your issue and we'll get back to you
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" icon={<AlertCircle className="w-5 h-5" />} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Subject *
              </label>
              <Input
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                maxLength={200}
              />
              <p className="text-xs text-surface-500 mt-1">
                {formData.subject.length}/200 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.category === cat.value
                        ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                        : "bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700 border border-surface-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map((pri) => (
                  <button
                    key={pri.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: pri.value })}
                    className={`px-4 py-3 rounded-lg text-left transition-colors ${
                      formData.priority === pri.value
                        ? "bg-brand-500/20 border border-brand-500/30"
                        : "bg-surface-800 hover:bg-surface-700 border border-surface-700"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        formData.priority === pri.value ? "text-brand-400" : "text-white"
                      }`}
                    >
                      {pri.label}
                    </span>
                    <p className="text-xs text-surface-500 mt-0.5">{pri.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Message *
              </label>
              <textarea
                placeholder="Please describe your issue in detail. Include any relevant information such as transaction IDs, dates, or error messages."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                maxLength={5000}
                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 resize-none"
              />
              <p className="text-xs text-surface-500 mt-1">
                {formData.message.length}/5000 characters
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Send className="w-4 h-4" />}
                isLoading={isLoading}
                className="flex-1 sm:flex-none"
              >
                Submit Ticket
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
