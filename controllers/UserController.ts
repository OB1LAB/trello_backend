import { NextFunction, Request, Response } from "express";
import { IUserAuth } from "../ifaces";
import bcrypt from "bcrypt";
import userService from "../services/user-service";
import ApiError from "../error/ApiError";
import tokenService from "../services/token-service";

class UserController {
  async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | object> {
    const { name, password } = req.body as IUserAuth;
    const user = await userService.getOneByName(name);
    if (!user) {
      return next(ApiError.badRequest("Пользователь не найден"));
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(ApiError.forbidden("Неверный пароль"));
    }
    const tokens = tokenService.generateTokens(user.name, user.id);
    await tokenService.saveToken(user.id, tokens.refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 31 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.startsWith("https")
        : false,
    });
    res.json({
      name: user.name,
      id: user.id,
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
      const token = await tokenService.removeToken(refreshToken);
      res.clearCookie("refreshToken");
      res.json(token);
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
      const userData = tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await tokenService.findToken(refreshToken);
      if (!userData || !tokenFromDb || tokenFromDb.userId === undefined) {
        return next(ApiError.UnauthorizedError());
      }
      const user = await userService.getOne(tokenFromDb.userId);
      if (!user) {
        return next(ApiError.UnauthorizedError());
      }
      const tokens = tokenService.generateTokens(user.name, user.id);
      await tokenService.saveToken(user.id, tokens.refreshToken);
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
        accessToken: tokens.accessToken,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
