/**
 * Security utilities and helpers
 */
import { randomBytes, createHash } from 'crypto';

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return generateSecureToken(32);
}

/**
 * Hash a token for storage
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string, hashedToken: string): boolean {
  const hash = hashToken(token);
  
  // Constant-time comparison to prevent timing attacks
  if (hash.length !== hashedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < hash.length; i++) {
    result |= hash.charCodeAt(i) ^ hashedToken.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Generate a nonce for CSP
 */
export function generateNonce(): string {
  return randomBytes(16).toString('base64');
}

/**
 * Validate origin header
 */
export function validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed.includes('*')) {
      // Simple wildcard matching
      const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
      return regex.test(origin);
    }
    return origin === allowed;
  });
}

/**
 * Prevent timing attacks by using constant-time string comparison
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Check if request is from a bot (basic detection)
 */
export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

/**
 * Check if IP is in a CIDR range (basic implementation)
 */
export function isIpInRange(ip: string, cidr: string): boolean {
  // This is a basic implementation
  // For production, consider using a library like 'ip-range-check'
  const [range, bits] = cidr.split('/');
  
  if (!bits) {
    return ip === range;
  }
  
  // IPv4 only for simplicity
  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(range);
  const mask = -1 << (32 - parseInt(bits, 10));
  
  return (ipNum & mask) === (rangeNum & mask);
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Security headers helper
 */
export const SECURITY_HEADERS = {
  HSTS: 'Strict-Transport-Security',
  CSP: 'Content-Security-Policy',
  X_FRAME: 'X-Frame-Options',
  X_CONTENT: 'X-Content-Type-Options',
  REFERRER: 'Referrer-Policy',
  PERMISSIONS: 'Permissions-Policy',
} as const;

/**
 * Get recommended security headers
 */
export function getSecurityHeaders(nonce?: string) {
  const headers: Record<string, string> = {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  };
  
  // CSP with nonce if provided
  if (nonce) {
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.upstash.io https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }
  
  return headers;
}
