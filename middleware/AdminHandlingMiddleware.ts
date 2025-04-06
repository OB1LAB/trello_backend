import { NextFunction, Request, Response } from "express";
import ApiError from "../error/ApiError";

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    // @ts-ignore
    if (req.user.isAdmin !== true) {
      return next(ApiError.forbidden("Недостаточно прав"));
    }
    next();
  } catch (e) {
    console.log(e);
    return next(ApiError.internal("Непредвиденная ошибка"));
  }
}
