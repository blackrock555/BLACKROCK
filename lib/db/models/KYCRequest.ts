import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKYCRequest extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fields: {
    fullName: string;
    dateOfBirth: Date;
    nationality: string;
    address: string;
    idType: 'passport' | 'national_id' | 'drivers_license';
    idNumber: string;
  };
  docsUrls: {
    idFront: string;
    idBack?: string;
    selfie: string;
    addressProof?: string;
  };
  cloudinaryIds?: {
    idFront?: string;
    idBack?: string;
    selfie?: string;
    addressProof?: string;
  };
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const kycRequestSchema = new Schema<IKYCRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One KYC request per user
    },
    fields: {
      fullName: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      nationality: { type: String, required: true },
      address: { type: String, required: true },
      idType: {
        type: String,
        enum: ['passport', 'national_id', 'drivers_license'],
        required: true,
      },
      idNumber: { type: String, required: true },
    },
    docsUrls: {
      idFront: { type: String, required: true },
      idBack: String,
      selfie: { type: String, required: true },
      addressProof: String,
    },
    cloudinaryIds: {
      idFront: String,
      idBack: String,
      selfie: String,
      addressProof: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminNote: String,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: userId already has unique:true which creates an index
kycRequestSchema.index({ status: 1, createdAt: -1 });

export const KYCRequest: Model<IKYCRequest> =
  mongoose.models.KYCRequest || mongoose.model<IKYCRequest>('KYCRequest', kycRequestSchema);
