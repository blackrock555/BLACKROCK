"use client";

import { useState, useEffect } from "react";
import { Download, QrCode as QrCodeIcon } from "lucide-react";

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  label?: string;
  showDownload?: boolean;
  className?: string;
}

export function QRCodeDisplay({
  data,
  size = 160,
  label,
  showDownload = true,
  className = "",
}: QRCodeDisplayProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!data) {
      setIsLoading(false);
      return;
    }

    // Generate QR code URL
    const url = `/api/qrcode?data=${encodeURIComponent(data)}&size=${size}&format=png`;
    setQrUrl(url);
    setIsLoading(false);
  }, [data, size]);

  const handleDownload = async () => {
    if (!qrUrl) return;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR code:", err);
    }
  };

  if (!data) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div
          className="bg-white rounded-xl p-4 flex items-center justify-center"
          style={{ width: size + 32, height: size + 32 }}
        >
          <QrCodeIcon className="w-16 h-16 text-surface-300" />
        </div>
        {label && <p className="text-surface-400 text-sm mt-2">{label}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="bg-white rounded-xl p-4">
        {isLoading ? (
          <div
            className="animate-pulse bg-surface-200 rounded"
            style={{ width: size, height: size }}
          />
        ) : error ? (
          <div
            className="flex items-center justify-center bg-surface-200 rounded"
            style={{ width: size, height: size }}
          >
            <QrCodeIcon className="w-16 h-16 text-surface-400" />
          </div>
        ) : (
          <img
            src={qrUrl || ""}
            alt="QR Code"
            width={size}
            height={size}
            className="rounded"
            onError={() => setError(true)}
          />
        )}
      </div>
      {label && <p className="text-surface-400 text-sm mt-2">{label}</p>}
      {showDownload && qrUrl && !error && (
        <button
          onClick={handleDownload}
          className="mt-2 flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download QR
        </button>
      )}
    </div>
  );
}
