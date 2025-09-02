export interface PageResponseResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}