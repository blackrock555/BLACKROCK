import { z } from 'zod';
import { KYC_DOCUMENT_TYPES } from '@/lib/constants';

const idTypeValues = KYC_DOCUMENT_TYPES.map((t) => t.value) as [string, ...string[]];

export const kycSubmissionSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date of birth'),
  nationality: z
    .string()
    .min(2, 'Nationality is required'),
  address: z
    .string()
    .min(10, 'Please enter your full address')
    .max(500, 'Address is too long'),
  idType: z.enum(idTypeValues),
  idNumber: z
    .string()
    .min(5, 'ID number is required')
    .max(50, 'ID number is too long'),
  idFrontUrl: z
    .string()
    .url('Please upload the front of your ID'),
  idBackUrl: z
    .string()
    .url('Please upload the back of your ID')
    .optional(),
  selfieUrl: z
    .string()
    .url('Please upload a selfie with your ID'),
  addressProofUrl: z
    .string()
    .url('Please upload proof of address')
    .optional(),
});

export const processKycSchema = z.object({
  kycId: z.string().min(1, 'KYC ID is required'),
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().optional(),
});

export type KycSubmissionInput = z.infer<typeof kycSubmissionSchema>;
export type ProcessKycInput = z.infer<typeof processKycSchema>;
