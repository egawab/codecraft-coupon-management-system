import { NextResponse } from 'next/server';
import { AppError } from './errors';
import type { ApiResponse } from '@/types';

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string | AppError,
  status: number = 500
): NextResponse<ApiResponse<never>> {
  const message = typeof error === 'string' ? error : error.message;
  const statusCode = typeof error === 'string' ? status : error.statusCode;

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: statusCode }
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// Helper object for cleaner API usage
export const apiResponse = {
  success: <T>(data: T, message?: string, status: number = 200) => 
    successResponse(data, message, status),
  
  error: (message: string, status: number = 500) => 
    errorResponse(message, status),
  
  unauthorized: (message: string = 'Unauthorized') => 
    errorResponse(message, 401),
  
  forbidden: (message: string = 'Forbidden') => 
    errorResponse(message, 403),
  
  badRequest: (message: string, errors?: unknown) => {
    if (errors) {
      return NextResponse.json(
        {
          success: false,
          error: message,
          errors,
        },
        { status: 400 }
      );
    }
    return errorResponse(message, 400);
  },
  
  notFound: (message: string = 'Resource not found') => 
    errorResponse(message, 404),
  
  paginated: <T>(data: T[], page: number, limit: number, total: number) =>
    paginatedResponse(data, page, limit, total),
};
