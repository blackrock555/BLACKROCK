import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Configure Cloudinary only if credentials are available
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

export type UploadFolder = 'kyc' | 'deposits' | 'documents' | 'avatars';

/**
 * Upload a file buffer to Cloudinary or return a data URL as fallback
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: UploadFolder;
    userId: string;
    filename?: string;
    resourceType?: 'image' | 'raw' | 'auto';
  }
): Promise<UploadResult> {
  const { folder, userId, filename, resourceType = 'auto' } = options;

  // If Cloudinary is not configured, use data URL as fallback (for development)
  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured, using data URL fallback');

    // Detect mime type from buffer
    let mimeType = 'application/octet-stream';
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      mimeType = 'image/jpeg';
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      mimeType = 'image/png';
    } else if (buffer[0] === 0x52 && buffer[1] === 0x49) {
      mimeType = 'image/webp';
    } else if (buffer[0] === 0x25 && buffer[1] === 0x50) {
      mimeType = 'application/pdf';
    }

    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;
    const publicId = `local_${folder}_${userId}_${filename || Date.now()}`;

    return {
      public_id: publicId,
      secure_url: dataUrl,
      format: mimeType.split('/')[1] || 'unknown',
      bytes: buffer.length,
    };
  }

  return new Promise((resolve, reject) => {
    // Avatar-specific transformations
    const avatarTransformation = folder === 'avatars' ? [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ] : resourceType === 'image' ? [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ] : undefined;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `blackrock/${folder}/${userId}`,
        public_id: filename || undefined,
        resource_type: resourceType,
        allowed_formats: folder === 'avatars'
          ? ['jpg', 'jpeg', 'png', 'webp']
          : ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
        max_bytes: folder === 'avatars' ? 5 * 1024 * 1024 : 10 * 1024 * 1024, // 5MB for avatars, 10MB for others
        transformation: avatarTransformation,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload file to cloud storage'));
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        } else {
          reject(new Error('Upload failed - no result'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  // Skip if it's a local/data URL
  if (publicId.startsWith('local_')) {
    return true;
  }

  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured, skipping delete');
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

/**
 * Generate a signed upload URL for client-side uploads (alternative method)
 */
export function generateSignedUploadParams(
  folder: UploadFolder,
  userId: string
): { timestamp: number; signature: string; apiKey: string; cloudName: string; folder: string } | null {
  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured');
    return null;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folderPath = `blackrock/${folder}/${userId}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: folderPath },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: folderPath,
  };
}

export { cloudinary, isCloudinaryConfigured };
