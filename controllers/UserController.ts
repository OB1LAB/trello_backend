import { NextFunction, Request, Response } from "express";
import { IUserAuth } from "../ifaces";
import bcrypt from "bcrypt";
import ApiError from "../error/ApiError";
import TokenService from "../services/token-service";
import UserService from "../services/user-service";
import { getUsers, updateTrello, updateUsers } from "../cache";

class UserController {
  async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | object> {
    const { name, password } = req.body as IUserAuth;
    const user = await UserService.getOneByName(name);
    if (!user) {
      return next(ApiError.badRequest("Пользователь не найден"));
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(ApiError.forbidden("Неверный пароль"));
    }
    const tokens = TokenService.generateTokens(
      user.name,
      user.id,
      user.isAdmin,
    );
    await TokenService.saveToken(user.id, tokens.refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 31 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.startsWith("https")
        : false,
    });
    res.json({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      accessToken: tokens.accessToken,
    });
    try {
    } catch (e) {}
  }
  async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | object> {
    try {
      const { refreshToken } = req.cookies;
      const token = await TokenService.removeToken(refreshToken);
      res.clearCookie("refreshToken");
      res.json(token);
    } catch (error) {
      return next(error);
    }
  }
  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | object> {
    try {
      const { newPassword }: { newPassword: string } = req.body;
      const hashNewPassword = bcrypt.hashSync(newPassword, 10);
      // @ts-ignore
      await UserService.changePassword(req.user.id, hashNewPassword);
      res.json({ status: "ok" });
    } catch (error) {
      return next(error);
    }
  }
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return next(ApiError.UnauthorizedError());
      }
      const userData = TokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await TokenService.findToken(refreshToken);
      if (!userData || !tokenFromDb || tokenFromDb.userId === undefined) {
        return next(ApiError.UnauthorizedError());
      }
      const user = await UserService.getOne(tokenFromDb.userId);
      if (!user) {
        return next(ApiError.UnauthorizedError());
      }
      const tokens = TokenService.generateTokens(
        user.name,
        user.id,
        user.isAdmin,
      );
      await TokenService.saveToken(user.id, tokens.refreshToken);
      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 31 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.DISCORD_REDIRECT
          ? process.env.DISCORD_REDIRECT.startsWith("https")
          : false,
      });
      res.json({
        name: user.name,
        id: user.id,
        isAdmin: user.isAdmin,
        accessToken: tokens.accessToken,
      });
    } catch (e) {
      next(e);
    }
  }
  async editUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        userId,
        password,
        isAdmin,
        isDeactivate,
      }: {
        userId: number;
        password: string;
        isAdmin: boolean;
        isDeactivate: boolean;
      } = req.body;
      const findUser = await UserService.getOne(userId);
      if (!findUser) {
        return next(ApiError.badRequest("Пользователь не найден"));
      }
      const primaryIsAdmin = findUser.isAdmin;
      // @ts-ignore
      if (findUser.isAdmin || findUser.createdByUserId !== req.user.id) {
        return next(ApiError.forbidden("Недостаточно прав"));
      }
      if (isDeactivate) {
        await UserService.editUser(userId, false, "_", true);
      } else if (password !== "") {
        const hashPassword = bcrypt.hashSync(password, 10);
        await UserService.editUser(userId, isAdmin, hashPassword);
      } else {
        await UserService.editUser(userId, isAdmin);
      }
      if (primaryIsAdmin !== isAdmin || isDeactivate) {
        await updateUsers();
        res.json("ok");
        if (isDeactivate) {
          await updateTrello();
        }
      } else {
        res.json("ok");
      }
    } catch (e) {
      next(e);
    }
  }
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        password,
        isAdmin,
      }: { name: string; password: string; isAdmin: boolean } = req.body;
      const user = await UserService.getOneByName(name);
      if (user) {
        return next(
          ApiError.badRequest(
            `Пользователь с номером карты ${name} уже создан`,
          ),
        );
      }
      const hashPassword = bcrypt.hashSync(password, 10);
      // @ts-ignore
      await UserService.create(name, hashPassword, isAdmin, req.user.isAdmin);
      res.json("ok");
      await updateUsers();
    } catch (e) {
      next(e);
    }
  }
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = getUsers();
      // @ts-ignore
      if (req.user.isAdmin) {
        return res.json(users.admin);
      }
      return res.json(users.user);
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
