import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWithdrawalCertificate extends Document {
  withdrawalId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  certificateNumber: string;
  userName: string;
  amount: number;
  network: "ERC20" | "TRC20" | "BEP20";
  toAddress: string;
  issueDate: Date;
  approvedBy: mongoose.Types.ObjectId;
  qrCodeData: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalCertificateSchema = new Schema<IWithdrawalCertificate>(
  {
    withdrawalId: {
      type: Schema.Types.ObjectId,
      ref: "WithdrawalRequest",
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    network: {
      type: String,
      enum: ["ERC20", "TRC20", "BEP20"],
      required: true,
    },
    toAddress: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrCodeData: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "REVOKED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique certificate number
WithdrawalCertificateSchema.statics.generateCertificateNumber = async function (): Promise<string> {
  const year = new Date().getFullYear();
  const count = await this.countDocuments({
    createdAt: {
      $gte: new Date(year, 0, 1),
      $lt: new Date(year + 1, 0, 1),
    },
  });
  const sequence = String(count + 1).padStart(5, "0");
  return `BR-WD-${year}-${sequence}`;
};

// Prevent model recompilation in development
const WithdrawalCertificate: Model<IWithdrawalCertificate> =
  mongoose.models.WithdrawalCertificate ||
  mongoose.model<IWithdrawalCertificate>(
    "WithdrawalCertificate",
    WithdrawalCertificateSchema
  );

export default WithdrawalCertificate;
