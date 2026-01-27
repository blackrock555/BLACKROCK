"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import Image from "next/image";

interface ProfileAvatarUploadProps {
  currentImage?: string | null;
  name: string;
  onUploadComplete?: (imageUrl: string | null) => void;
}

export function ProfileAvatarUpload({
  currentImage,
  name,
  onUploadComplete,
}: ProfileAvatarUploadProps) {
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/user/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImage(data.image);
        onUploadComplete?.(data.image);
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!image) return;

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/user/profile/avatar", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setImage(null);
        onUploadComplete?.(null);
      } else {
        setError(data.error || "Failed to remove image");
      }
    } catch (err) {
      setError("Failed to remove image. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    if (!isUploading && !isDeleting) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        {/* Avatar Display */}
        <div
          className={`
            w-24 h-24 rounded-full overflow-hidden border-4 border-surface-700
            ${!isUploading && !isDeleting ? "cursor-pointer" : "cursor-not-allowed"}
            transition-all duration-200 group-hover:border-brand-500/50
          `}
          onClick={handleClick}
        >
          {image ? (
            <Image
              src={image}
              alt={name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-surface-700 flex items-center justify-center">
              {name ? (
                <span className="text-2xl font-bold text-surface-300">
                  {getInitials(name)}
                </span>
              ) : (
                <User className="w-10 h-10 text-surface-500" />
              )}
            </div>
          )}

          {/* Hover Overlay */}
          {!isUploading && !isDeleting && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          )}

          {/* Loading Overlay */}
          {(isUploading || isDeleting) && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Delete Button */}
        {image && !isUploading && !isDeleting && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="absolute -bottom-1 -right-1 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
            title="Remove photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Helper Text */}
      <p className="text-surface-500 text-xs mt-3 text-center">
        Click to upload a photo
        <br />
        JPEG, PNG, WebP (max 5MB)
      </p>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

export default ProfileAvatarUpload;
