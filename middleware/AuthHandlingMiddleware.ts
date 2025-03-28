import { NextFunction, Request } from "express";
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
    // @ts-ignore
    req.user = tokenService.validateAccessToken(accessToken);
    next();
  } catch (error) {
    console.log(error);
    return next(ApiError.UnauthorizedError());
  }
}
