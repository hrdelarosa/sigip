export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}
