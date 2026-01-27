import mongoose, { Schema, Document, Types } from 'mongoose';

// Ticket message interface
export interface ITicketMessage {
  senderId: Types.ObjectId;
  senderType: 'USER' | 'ADMIN';
  senderName: string;
  content: string;
  attachments?: string[];
  createdAt: Date;
}

// Support ticket interface
export interface ISupportTicket extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  ticketNumber: string;
  subject: string;
  category: 'GENERAL' | 'DEPOSIT' | 'WITHDRAWAL' | 'KYC' | 'TECHNICAL' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_RESPONSE' | 'RESOLVED' | 'CLOSED';
  messages: ITicketMessage[];
  assignedTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderType: {
    type: String,
    enum: ['USER', 'ADMIN'],
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  attachments: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: ['GENERAL', 'DEPOSIT', 'WITHDRAWAL', 'KYC', 'TECHNICAL', 'OTHER'],
      default: 'GENERAL',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    messages: [TicketMessageSchema],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate ticket number before saving
SupportTicketSchema.pre('save', async function () {
  if (this.isNew && !this.ticketNumber) {
    try {
      const year = new Date().getFullYear();
      const SupportTicketModel = mongoose.models.SupportTicket || mongoose.model('SupportTicket');
      const count = await SupportTicketModel.countDocuments();
      this.ticketNumber = `TKT-${year}-${String(count + 1).padStart(6, '0')}`;
    } catch {
      // Fallback: generate random ticket number if count fails
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 999999);
      this.ticketNumber = `TKT-${year}-${String(random).padStart(6, '0')}`;
    }
  }
});

// Indexes for common queries
SupportTicketSchema.index({ userId: 1, status: 1 });
SupportTicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1 });

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
