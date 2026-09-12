import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled Error:', err);

  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 400, err.errors);
  }

  if (err.code === 'P2002') {
    return sendError(res, 'Dữ liệu trùng lặp (email, mã số hoặc khóa duy nhất đã tồn tại)', 409);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống máy chủ';
  
  return sendError(res, message, statusCode);
};
