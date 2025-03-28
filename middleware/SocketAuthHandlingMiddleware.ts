import ApiError from "../error/ApiError";
import tokenService from "../services/token-service";
import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ExtendedError } from "socket.io/dist/namespace";
import UserService from "../services/user-service";

export default async function (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  next: (error?: ExtendedError | undefined) => void,
) {
  const token = socket.handshake.auth.Authorization;
  if (!token) {
    next(ApiError.UnauthorizedError());
  }
  const accessToken = token.split(" ")[1];
  if (!accessToken) {
    return next(ApiError.UnauthorizedError());
  }
  const userData = tokenService.validateAccessToken(accessToken);
  if (!userData) {
    return next(ApiError.UnauthorizedError());
  }
  const user = await UserService.getOne(userData.id);
  if (!user) {
    return next(ApiError.UnauthorizedError());
  }
  socket.data.user = user;
  next();
}
