import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants';

export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
};

export function getPaginationParams(
  page?: string | number,
  limit?: string | number
): PaginationParams {
  const pageNum = Number(page) || 1;
  const limitNum = Math.min(Number(limit) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  
  return {
    page: Math.max(1, pageNum),
    limit: limitNum,
    skip: (Math.max(1, pageNum) - 1) * limitNum,
  };
}

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}
