import { NextFunction, Request, Response } from "express";
import ApiError from "../error/ApiError";
import tokenService from "../services/token-service";

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }
    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }
    const user = tokenService.validateAccessToken(accessToken);
    if (user === null) {
      return next(ApiError.UnauthorizedError());
    }
    // @ts-ignore
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return next(ApiError.UnauthorizedError());
  }
}
