import { z } from 'zod';
import { MIN_DEPOSIT, MIN_WITHDRAWAL, SUPPORTED_NETWORKS } from '@/lib/constants';
import { isValidWalletAddress, getAddressFormatDescription } from '@/lib/security/wallet-validation';

const networkValues = SUPPORTED_NETWORKS.map((n) => n.value) as [string, ...string[]];

export const depositRequestSchema = z.object({
  amount: z
    .number()
    .min(MIN_DEPOSIT, `Minimum deposit is ${MIN_DEPOSIT} USDT`),
  network: z.enum(networkValues),
  proofUrl: z.string().url('Please upload a valid proof of payment'),
  txHash: z.string().optional(),
});

export const withdrawalRequestSchema = z
  .object({
    amount: z
      .number()
      .min(MIN_WITHDRAWAL, `Minimum withdrawal is ${MIN_WITHDRAWAL} USDT`),
    toAddress: z.string().min(1, 'Wallet address is required'),
    network: z.enum(networkValues),
  })
  .refine(
    (data) => isValidWalletAddress(data.toAddress, data.network),
    {
      message: 'Invalid wallet address format for the selected network',
      path: ['toAddress'],
    }
  );

export const processDepositSchema = z.object({
  depositId: z.string().min(1, 'Deposit ID is required'),
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().optional(),
});

export const processWithdrawalSchema = z.object({
  withdrawalId: z.string().min(1, 'Withdrawal ID is required'),
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().optional(),
  txHash: z.string().optional(),
});

export type DepositRequestInput = z.infer<typeof depositRequestSchema>;
export type WithdrawalRequestInput = z.infer<typeof withdrawalRequestSchema>;
export type ProcessDepositInput = z.infer<typeof processDepositSchema>;
export type ProcessWithdrawalInput = z.infer<typeof processWithdrawalSchema>;
