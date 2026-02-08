import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET!;
const JWT_ACCESS_EXPIRY = '15m'; // 15 minutes
const JWT_REFRESH_EXPIRY = '30d'; // 30 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
}

/**
 * Generate access token (15 minutes)
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
    issuer: 'kobonz',
    audience: 'kobonz-api',
  });
}

/**
 * Generate refresh token (30 days)
 */
export function generateRefreshToken(userId: string): string {
  const tokenId = nanoid(32);
  return jwt.sign(
    {
      userId,
      tokenId,
      type: 'refresh',
    },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRY,
      issuer: 'kobonz',
      audience: 'kobonz-api',
    }
  );
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JWTPayload): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload.userId);

  const accessDecoded = jwt.decode(accessToken) as jwt.JwtPayload;
  const refreshDecoded = jwt.decode(refreshToken) as jwt.JwtPayload;

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: accessDecoded.exp || 0,
    refreshTokenExpiry: refreshDecoded.exp || 0,
  };
}

/**
 * Verify and decode access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'kobonz',
      audience: 'kobonz-api',
    }) as JWTPayload;
    return decoded;
  } catch (_error) {
    return null;
  }
}

/**
 * Verify and decode refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; tokenId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'kobonz',
      audience: 'kobonz-api',
    }) as { userId: string; tokenId: string; type: string };

    if (decoded.type !== 'refresh') {
      return null;
    }

    return {
      userId: decoded.userId,
      tokenId: decoded.tokenId,
    };
  } catch (_error) {
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): jwt.JwtPayload | null {
  try {
    return jwt.decode(token) as jwt.JwtPayload;
  } catch (_error) {
    return null;
  }
}

/**
 * Get token expiry timestamp
 */
export function getTokenExpiry(token: string): number | null {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return Date.now() >= expiry * 1000;
}
