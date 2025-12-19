/**
 * Common API response types
 */

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Action result for server actions */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
