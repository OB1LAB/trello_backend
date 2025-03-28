import { Request, Response, NextFunction } from "express";
import ApiError from "../error/ApiError";

export default function (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.log(err);
  return res.status(500).json({ message: "Непредвиденная ошибка" });
}
