import { Prisma } from '@prisma/client';

// ============================================
// AFFILIATE TYPES
// ============================================

export type AffiliateWithRelations = Prisma.AffiliateGetPayload<{
  include: {
    user: true;
    affiliateLinks: true;
    clicks: true;
    conversions: true;
    payoutRequests: true;
  };
}>;

export type AffiliateLinkWithRelations = Prisma.AffiliateLinkGetPayload<{
  include: {
    affiliate: true;
    coupon: true;
    clicks: true;
    conversions: true;
  };
}>;

export type AffiliateClickWithRelations = Prisma.AffiliateClickGetPayload<{
  include: {
    affiliateLink: true;
    affiliate: true;
    conversion: true;
  };
}>;

export type AffiliateConversionWithRelations = Prisma.AffiliateConversionGetPayload<{
  include: {
    affiliateLink: true;
    affiliate: true;
    click: true;
    coupon: true;
  };
}>;

export type PayoutRequestWithRelations = Prisma.PayoutRequestGetPayload<{
  include: {
    affiliate: {
      include: {
        user: true;
      };
    };
  };
}>;

// ============================================
// DASHBOARD TYPES
// ============================================

export interface AffiliateStats {
  affiliate: {
    id: string;
    affiliateCode: string;
    status: string;
    defaultCommissionRate: number;
  };
  balance: {
    pending: number;
    available: number;
    totalEarnings: number;
    totalPaidOut: number;
  };
  performance: {
    totalClicks: number;
    totalConversions: number;
    ctr: number;
    totalLinks: number;
  };
  recentConversions: AffiliateConversionSummary[];
  topLinks: AffiliateLinkSummary[];
}

export interface AffiliateConversionSummary {
  id: string;
  convertedAt: Date;
  orderValue: number | null;
  commissionRate: number;
  commissionAmount: number;
  isPending: boolean;
  coupon?: {
    code: string;
    title: string;
  };
}

export interface AffiliateLinkSummary {
  id: string;
  trackingCode: string;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  ctr: number;
  url: string;
  coupon?: {
    code: string;
    title: string;
    slug: string;
  };
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface CreateAffiliateLinkRequest {
  couponId?: string;
  customTrackingCode?: string;
}

export interface CreateAffiliateLinkResponse {
  id: string;
  trackingCode: string;
  url: string;
  couponId: string | null;
  createdAt: Date;
}

export interface PayoutRequestRequest {
  amount: number;
  paymentMethod: string;
  paymentEmail?: string;
  paymentDetails?: string;
}

export interface PayoutRequestResponse {
  id: string;
  amount: number;
  status: string;
  requestedAt: Date;
}

export interface ProcessPayoutRequest {
  action: 'approve' | 'reject';
  transactionId?: string;
  rejectionReason?: string;
}

// ============================================
// COOKIE TYPES
// ============================================

export interface AffiliateCookieData {
  affiliateLinkId: string;
  cookieId: string;
  timestamp: number;
}
