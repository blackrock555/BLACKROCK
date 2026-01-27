'use client';

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { Upload, X, File as FileIcon, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in bytes
  // Mode 1: Immediate upload (returns URL)
  onUpload?: (file: File) => Promise<string>;
  // Mode 2: Simple file selection (returns File object)
  onChange?: (file: File | null) => void;
  value?: string | File | null; // URL string or File object
  onRemove?: () => void;
  error?: string;
  helperText?: string;
  className?: string;
}

// Helper to check if value is a File object
function isFileObject(value: unknown): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'size' in value &&
    'type' in value &&
    typeof (value as File).arrayBuffer === 'function'
  );
}

export function FileUpload({
  label,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  onUpload,
  onChange,
  onRemove,
  value,
  error,
  helperText,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate preview URL for File objects
  useEffect(() => {
    if (isFileObject(value)) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === 'string' && value) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFile = async (file: File) => {
    setUploadError(null);

    // Validate file size
    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    const isValidType = acceptedTypes.some((type) => {
      if (type === '*/*' || type === '*') return true;
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isValidType) {
      setUploadError('Invalid file type');
      return;
    }

    // Mode 1: Immediate upload
    if (onUpload) {
      try {
        setIsUploading(true);
        await onUpload(file);
      } catch (err) {
        setUploadError('Failed to upload file');
      } finally {
        setIsUploading(false);
      }
    }
    // Mode 2: Simple file selection
    else if (onChange) {
      onChange(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    if (onChange) {
      onChange(null);
    }
    onRemove?.();
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = error || uploadError;
  const hasValue = value !== null && value !== undefined && value !== '';
  const isValueFile = isFileObject(value);
  const fileName = isValueFile ? value.name : 'Uploaded file';

  // Check if it's an image
  const isImage = previewUrl && (
    previewUrl.startsWith('data:image') ||
    previewUrl.startsWith('blob:') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(previewUrl) ||
    (isValueFile && value.type.startsWith('image/'))
  );

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-surface-300 mb-1.5">{label}</label>
      )}

      {hasValue && previewUrl ? (
        // Preview
        <div className="relative rounded-lg border border-surface-700 overflow-hidden bg-surface-900">
          {isImage ? (
            <div className="relative aspect-video">
              <img
                src={previewUrl}
                alt="Uploaded file"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <FileIcon className="w-8 h-8 text-surface-400" />
              <span className="text-sm text-surface-300 truncate flex-1">
                {fileName}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-surface-900/80 hover:bg-surface-800 rounded-lg text-surface-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Upload zone
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center
            py-8 px-4 rounded-lg border-2 border-dashed cursor-pointer
            transition-colors duration-200
            ${isDragging
              ? 'border-brand-500 bg-brand-500/10'
              : displayError
                ? 'border-red-500/50 bg-red-500/5 hover:border-red-500'
                : 'border-surface-700 bg-surface-900/50 hover:border-surface-600 hover:bg-surface-900'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />

          {isUploading ? (
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center mb-3">
                {accept.includes('image') ? (
                  <ImageIcon className="w-6 h-6 text-surface-400" />
                ) : (
                  <Upload className="w-6 h-6 text-surface-400" />
                )}
              </div>
              <p className="text-sm text-surface-300 mb-1">
                <span className="text-brand-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-surface-500">
                {accept.replace(/\*/g, '').replace(/,/g, ', ').replace(/\./g, '').toUpperCase() || 'Any file'} up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </>
          )}
        </div>
      )}

      {(displayError || helperText) && (
        <p className={`mt-1.5 text-sm ${displayError ? 'text-red-400' : 'text-surface-500'}`}>
          {displayError || helperText}
        </p>
      )}
    </div>
  );
}
