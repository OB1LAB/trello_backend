import { NextFunction, Request, Response } from "express";
import ApiError from "../error/ApiError";
import { getTrello } from "../cache";

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    const { userCreateTrelloList } = getTrello();
    const { trelloId }: { trelloId: number } = req.body;
    // @ts-ignore
    const userId: number = req.user.id;
    // @ts-ignore
    if (!userCreateTrelloList[userId].includes(trelloId)) {
      return next(ApiError.forbidden("Недостаточно прав"));
    }
    next();
  } catch (e) {
    console.log(e);
    return next(ApiError.internal("Непредвиденная ошибка"));
  }
}
