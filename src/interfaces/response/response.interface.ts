export interface IPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: IPagination;
}
