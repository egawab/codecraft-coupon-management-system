import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from './errors';
import { hasPermission, Permission } from './rbac';

/**
 * Get the current authenticated user from server session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Require authentication - throws if user not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!user.isActive) {
    throw new ForbiddenError('Account is disabled');
  }

  return user;
}

/**
 * Require specific role - throws if user doesn't have the role
 */
export async function requireRole(role: Role | Role[]) {
  const user = await requireAuth();

  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }

  return user;
}

/**
 * Require specific permission - throws if user doesn't have the permission
 */
export async function requirePermission(permission: Permission | Permission[]) {
  const user = await requireAuth();

  const requiredPermissions = Array.isArray(permission) ? permission : [permission];

  const hasRequiredPermission = requiredPermissions.some((perm) =>
    hasPermission(user.role, perm)
  );

  if (!hasRequiredPermission) {
    throw new ForbiddenError('Insufficient permissions');
  }

  return user;
}

/**
 * Check if current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Check if current user has specific role
 */
export async function hasRole(role: Role | Role[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const allowedRoles = Array.isArray(role) ? role : [role];
  return allowedRoles.includes(user.role);
}

/**
 * Check if current user has specific permission
 */
export async function checkPermission(permission: Permission | Permission[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some((perm) => hasPermission(user.role, perm));
}

/**
 * Check if current user can access a resource
 */
export async function canAccessResource(resourceOwnerId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Super admin can access everything
  if (user.role === Role.SUPER_ADMIN) {
    return true;
  }

  // User can access their own resources
  return user.id === resourceOwnerId;
}

/**
 * Require resource ownership or admin access
 */
export async function requireResourceAccess(resourceOwnerId: string) {
  const user = await requireAuth();

  // Super admin can access everything
  if (user.role === Role.SUPER_ADMIN) {
    return user;
  }

  // User must own the resource
  if (user.id !== resourceOwnerId) {
    throw new ForbiddenError('You do not have access to this resource');
  }

  return user;
}

/**
 * Require email verification
 */
export async function requireEmailVerification() {
  const user = await requireAuth();

  if (!user.emailVerified) {
    throw new ForbiddenError('Email verification required');
  }

  return user;
}
