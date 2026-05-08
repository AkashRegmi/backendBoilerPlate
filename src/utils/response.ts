import { Response } from "express";
import { IApiResponse, IPagination } from "../interfaces/response/response.interface";

export const sendResponse = <T>({
  res,
  statusCode = 200,
  message,
  data,
  pagination,
}: {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
  pagination?: IPagination;
}) => {
  const response: IApiResponse<T> & { statusCode: number } = {
    success: statusCode < 400,
    message,
    statusCode,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};
