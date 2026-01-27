import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('avatarPublicId');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'avatars',
      userId: session.user.id,
      filename: `avatar_${Date.now()}`,
      resourceType: 'image',
    });

    // Delete old avatar if exists
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    // Update user with new avatar
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        image: uploadResult.secure_url,
        avatarPublicId: uploadResult.public_id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      image: uploadResult.secure_url,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('avatarPublicId');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete from Cloudinary if exists
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    // Remove avatar from user
    await User.findByIdAndUpdate(session.user.id, {
      $unset: {
        image: 1,
        avatarPublicId: 1,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    );
  }
}
