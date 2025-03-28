import jwt from "jsonwebtoken";
import { TokenModel } from "../models/models";

interface IPayload {
  userName: string;
  id: number;
}

class TokenService {
  generateTokens(userName: string, id: number) {
    const payload = { userName, id };
    const accessToken = jwt.sign(
      payload,
      process.env.SECRET_ACCESS_KEY || "accessToken",
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.SECRET_REFRESH_KEY || "refreshToken",
      { expiresIn: "31d" },
    );
    return {
      accessToken,
      refreshToken,
    };
  }
  validateAccessToken(accessToken: string) {
    try {
      return jwt.verify(
        accessToken,
        process.env.SECRET_ACCESS_KEY || "accessToken",
      ) as IPayload;
    } catch (e) {
      return null;
    }
  }
  validateRefreshToken(refreshToken: string) {
    try {
      return jwt.verify(
        refreshToken,
        process.env.SECRET_REFRESH_KEY || "refreshToken",
      ) as IPayload;
    } catch (e) {
      return null;
    }
  }
  async saveToken(userId: number, refreshToken: string) {
    const tokenData = await TokenModel.findOne({ where: { userId: userId } });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return await tokenData.save();
    }
    return await TokenModel.create({
      userId: userId,
      refreshToken: refreshToken,
    });
  }

  async removeToken(refreshToken: string) {
    return await TokenModel.destroy({ where: { refreshToken: refreshToken } });
  }

  async findToken(refreshToken: string) {
    return await TokenModel.findOne({ where: { refreshToken: refreshToken } });
  }
}

export default new TokenService();
