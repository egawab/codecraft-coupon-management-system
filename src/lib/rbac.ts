import { Role } from '@prisma/client';

/**
 * Role hierarchy - higher roles inherit permissions from lower roles
 */
const roleHierarchy: Record<Role, number> = {
  [Role.USER]: 0,
  [Role.AFFILIATE]: 1,
  [Role.STORE_OWNER]: 2,
  [Role.SUPER_ADMIN]: 3,
};

/**
 * Permission definitions
 */
export enum Permission {
  // User permissions
  VIEW_COUPONS = 'view_coupons',
  USE_COUPONS = 'use_coupons',
  FAVORITE_COUPONS = 'favorite_coupons',
  WRITE_REVIEWS = 'write_reviews',
  UPDATE_PROFILE = 'update_profile',

  // Affiliate permissions
  CREATE_AFFILIATE_LINKS = 'create_affiliate_links',
  VIEW_AFFILIATE_ANALYTICS = 'view_affiliate_analytics',
  MANAGE_AFFILIATE_LINKS = 'manage_affiliate_links',

  // Store Owner permissions
  CREATE_STORE = 'create_store',
  MANAGE_OWN_STORES = 'manage_own_stores',
  CREATE_COUPONS = 'create_coupons',
  MANAGE_OWN_COUPONS = 'manage_own_coupons',
  VIEW_STORE_ANALYTICS = 'view_store_analytics',
  RESPOND_TO_REVIEWS = 'respond_to_reviews',

  // Super Admin permissions
  MANAGE_ALL_USERS = 'manage_all_users',
  MANAGE_ALL_STORES = 'manage_all_stores',
  MANAGE_ALL_COUPONS = 'manage_all_coupons',
  MANAGE_CATEGORIES = 'manage_categories',
  MANAGE_LOCATIONS = 'manage_locations',
  VIEW_SYSTEM_ANALYTICS = 'view_system_analytics',
  MANAGE_ROLES = 'manage_roles',
  DELETE_USERS = 'delete_users',
}

/**
 * Role-Permission mapping
 */
const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.VIEW_COUPONS,
    Permission.USE_COUPONS,
    Permission.FAVORITE_COUPONS,
    Permission.WRITE_REVIEWS,
    Permission.UPDATE_PROFILE,
  ],
  [Role.AFFILIATE]: [
    // Inherits USER permissions plus:
    Permission.CREATE_AFFILIATE_LINKS,
    Permission.VIEW_AFFILIATE_ANALYTICS,
    Permission.MANAGE_AFFILIATE_LINKS,
  ],
  [Role.STORE_OWNER]: [
    // Inherits USER permissions plus:
    Permission.CREATE_STORE,
    Permission.MANAGE_OWN_STORES,
    Permission.CREATE_COUPONS,
    Permission.MANAGE_OWN_COUPONS,
    Permission.VIEW_STORE_ANALYTICS,
    Permission.RESPOND_TO_REVIEWS,
  ],
  [Role.SUPER_ADMIN]: [
    // Has all permissions
    Permission.MANAGE_ALL_USERS,
    Permission.MANAGE_ALL_STORES,
    Permission.MANAGE_ALL_COUPONS,
    Permission.MANAGE_CATEGORIES,
    Permission.MANAGE_LOCATIONS,
    Permission.VIEW_SYSTEM_ANALYTICS,
    Permission.MANAGE_ROLES,
    Permission.DELETE_USERS,
  ],
};

/**
 * Get all permissions for a role (including inherited)
 */
export function getRolePermissions(role: Role): Permission[] {
  const permissions = new Set<Permission>();

  // Add permissions for current role
  rolePermissions[role].forEach((permission) => permissions.add(permission));

  // Add inherited permissions from lower roles
  const currentRoleLevel = roleHierarchy[role];
  Object.entries(roleHierarchy).forEach(([r, level]) => {
    if (level < currentRoleLevel) {
      rolePermissions[r as Role].forEach((permission) => permissions.add(permission));
    }
  });

  // Super Admin gets all permissions
  if (role === Role.SUPER_ADMIN) {
    Object.values(Permission).forEach((permission) => permissions.add(permission));
  }

  return Array.from(permissions);
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if one role is higher than another in the hierarchy
 */
export function isRoleHigherThan(role: Role, comparisonRole: Role): boolean {
  return roleHierarchy[role] > roleHierarchy[comparisonRole];
}

/**
 * Check if a role can manage another role
 */
export function canManageRole(userRole: Role, targetRole: Role): boolean {
  // Super admin can manage all roles
  if (userRole === Role.SUPER_ADMIN) {
    return true;
  }

  // Users cannot manage roles equal to or higher than their own
  return roleHierarchy[userRole] > roleHierarchy[targetRole];
}

/**
 * Get minimum required role for a permission
 */
export function getMinimumRoleForPermission(permission: Permission): Role | null {
  for (const [role, permissions] of Object.entries(rolePermissions)) {
    if (permissions.includes(permission)) {
      return role as Role;
    }
  }
  return null;
}

/**
 * Validate resource ownership
 */
export function canAccessResource(
  userRole: Role,
  userId: string,
  resourceOwnerId: string
): boolean {
  // Super admin can access everything
  if (userRole === Role.SUPER_ADMIN) {
    return true;
  }

  // Owner can access their own resources
  if (userId === resourceOwnerId) {
    return true;
  }

  return false;
}

/**
 * Role display names
 */
export const roleDisplayNames: Record<Role, string> = {
  [Role.USER]: 'User',
  [Role.AFFILIATE]: 'Affiliate',
  [Role.STORE_OWNER]: 'Store Owner',
  [Role.SUPER_ADMIN]: 'Super Admin',
};

/**
 * Role descriptions
 */
export const roleDescriptions: Record<Role, string> = {
  [Role.USER]: 'Basic user with access to browse and use coupons',
  [Role.AFFILIATE]: 'Can create affiliate links and earn commissions',
  [Role.STORE_OWNER]: 'Can create and manage stores and coupons',
  [Role.SUPER_ADMIN]: 'Full system access with all permissions',
};
