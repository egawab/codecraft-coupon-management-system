import { z } from 'zod';

// Affiliate registration/application schema
export const affiliateRegistrationSchema = z.object({
  paymentEmail: z.string().email('Invalid payment email address'),
  paymentMethod: z.enum(['paypal', 'bank_transfer', 'other'], {
    errorMap: () => ({ message: 'Please select a payment method' }),
  }),
  bankDetails: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Payout request schema
export const payoutRequestSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0').min(10, 'Minimum payout amount is $10'),
  paymentMethod: z.enum(['paypal', 'bank_transfer', 'other']),
  paymentEmail: z.string().email('Invalid payment email').optional(),
  paymentDetails: z.string().optional(),
});

// Affiliate link creation schema
export const createAffiliateLinkSchema = z.object({
  couponId: z.string().optional(),
  customTrackingCode: z.string().optional().refine(
    (code) => !code || /^[A-Z0-9_-]+$/i.test(code),
    'Tracking code can only contain letters, numbers, hyphens, and underscores'
  ),
});

// Conversion tracking schema
export const trackConversionSchema = z.object({
  affiliateLinkId: z.string(),
  couponId: z.string().optional(),
  orderValue: z.number().positive().optional(),
  userId: z.string().optional(),
});

export type AffiliateRegistrationInput = z.infer<typeof affiliateRegistrationSchema>;
export type PayoutRequestInput = z.infer<typeof payoutRequestSchema>;
export type CreateAffiliateLinkInput = z.infer<typeof createAffiliateLinkSchema>;
export type TrackConversionInput = z.infer<typeof trackConversionSchema>;
