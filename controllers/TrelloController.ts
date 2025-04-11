import { NextFunction, Request, Response } from "express";
import TrelloService from "../services/trello-service";
import { getTrello, updateTrello } from "../cache";
import { ICacheTrello } from "../ifaces";
import ApiError from "../error/ApiError";

const getTrelloResponse = (selfUserId: number) => {
  const trelloList: ICacheTrello = {};
  const { trello, userTrelloList, userCreateTrelloList } = getTrello();
  const trelloListIds: number[] = [
    ...(Object.keys(userCreateTrelloList).includes(selfUserId.toString())
      ? userCreateTrelloList[selfUserId]
      : []),
    ...(Object.keys(userTrelloList).includes(selfUserId.toString())
      ? userTrelloList[selfUserId]
      : []),
  ];
  for (const trelloId of trelloListIds) {
    trelloList[trelloId] = trello[trelloId];
  }
  return trelloList;
};

class TrelloController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | object> {
    try {
      const {
        trelloName,
        accessUsers,
      }: { trelloName: string; accessUsers: number[] } = req.body;
      const trello = await TrelloService.create(
        trelloName,
        accessUsers,
        // @ts-ignore
        req.user.id,
      );
      await updateTrello();
      res.json({
        trelloId: trello.id,
        // @ts-ignore
        trello: getTrelloResponse(req.user.id),
      });
    } catch (e) {
      next(e);
    }
  }
  async edit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | object> {
    try {
      const {
        trelloId,
        trelloName,
        accessUsers,
      }: {
        trelloId: number;
        trelloName: string;
        accessUsers: number[];
      } = req.body;
      const trello = await TrelloService.findById(trelloId);
      if (!trello) {
        return next(ApiError.badRequest(`Трелло с ID ${trelloId} не найдено`));
      }
      // @ts-ignore
      if (trello.createdBy !== req.user.id) {
        return next(ApiError.forbidden(`Недостаточно прав`));
      }
      trello.trelloName = trelloName;
      await trello.setUsers(accessUsers);
      await trello.save();
      await updateTrello();
      // @ts-ignore
      res.json(getTrelloResponse(req.user.id));
    } catch (e) {
      next(e);
    }
  }
  async disable(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | object> {
    try {
      const {
        trelloId,
      }: {
        trelloId: number;
      } = req.body;
      const trello = await TrelloService.findById(trelloId);
      if (!trello) {
        return next(ApiError.badRequest(`Трелло с ID ${trelloId} не найдено`));
      }
      // @ts-ignore
      if (trello.createdBy !== req.user.id) {
        return next(ApiError.forbidden(`Недостаточно прав`));
      }
      trello.isDeactivate = true;
      await trello.save();
      await updateTrello();
      // @ts-ignore
      res.json(getTrelloResponse(req.user.id));
    } catch (e) {
      next(e);
    }
  }
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | object> {
    try {
      // @ts-ignore
      return res.json(getTrelloResponse(req.user.id));
    } catch (e) {
      next(e);
    }
  }
}

export default new TrelloController();
