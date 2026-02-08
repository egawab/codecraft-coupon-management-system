import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from './errors';
import { hasPermission, Permission } from './rbac';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    role: Role;
    emailVerified: Date | null;
    isActive: boolean;
  };
}

/**
 * Middleware to require authentication for API routes
 */
export async function withAuth(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!token.isActive) {
    throw new ForbiddenError('Account is disabled');
  }

  // Extend request with user data
  const authenticatedRequest = request as AuthenticatedRequest;
  authenticatedRequest.user = {
    id: token.userId as string,
    email: token.email as string,
    role: token.role as Role,
    emailVerified: token.emailVerified as Date | null,
    isActive: token.isActive as boolean,
  };

  return authenticatedRequest;
}

/**
 * Middleware to require specific role for API routes
 */
export async function withRole(
  request: NextRequest,
  allowedRoles: Role | Role[]
): Promise<AuthenticatedRequest> {
  const authenticatedRequest = await withAuth(request);

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(authenticatedRequest.user.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }

  return authenticatedRequest;
}

/**
 * Middleware to require specific permission for API routes
 */
export async function withPermission(
  request: NextRequest,
  requiredPermission: Permission | Permission[]
): Promise<AuthenticatedRequest> {
  const authenticatedRequest = await withAuth(request);

  const permissions = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  const hasRequiredPermission = permissions.some((perm) =>
    hasPermission(authenticatedRequest.user.role, perm)
  );

  if (!hasRequiredPermission) {
    throw new ForbiddenError('Insufficient permissions');
  }

  return authenticatedRequest;
}

/**
 * Middleware to require email verification for API routes
 */
export async function withEmailVerification(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  const authenticatedRequest = await withAuth(request);

  if (!authenticatedRequest.user.emailVerified) {
    throw new ForbiddenError('Email verification required');
  }

  return authenticatedRequest;
}

/**
 * Check rate limiting using Redis
 */
export async function withRateLimit(
  request: NextRequest,
  limit: number = 100,
  window: number = 60
): Promise<void> {
  const { rateLimitByIP } = await import('./rate-limit');
  
  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  
  const result = await rateLimitByIP(ip, limit, window);
  
  if (!result.success) {
    const error: any = new Error('Too many requests');
    error.statusCode = 429;
    error.headers = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
      'Retry-After': result.retryAfter?.toString() || '60',
    };
    throw error;
  }
}

/**
 * Validate API key for external API access
 */
export async function validateApiKey(request: NextRequest): Promise<void> {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    throw new UnauthorizedError('API key required');
  }

  // TODO: Validate API key against database
  // For now, check against environment variable
  if (apiKey !== process.env.API_KEY) {
    throw new UnauthorizedError('Invalid API key');
  }
}

/**
 * Validate CSRF token
 */
export async function validateCsrfToken(request: NextRequest): Promise<void> {
  // Skip CSRF check for GET requests
  if (request.method === 'GET') {
    return;
  }

  const csrfTokenFromHeader = request.headers.get('X-CSRF-Token');
  const csrfTokenFromCookie = request.cookies.get('next-auth.csrf-token')?.value;

  if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
    throw new ForbiddenError('CSRF token missing');
  }

  // In production, implement proper CSRF validation
  // NextAuth handles this automatically for auth routes
}
