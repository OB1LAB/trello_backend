import { UserModel } from "../models/models";

class UserService {
  async getOne(userId: number) {
    return await UserModel.findByPk(userId);
  }
  async getOneByName(name: string) {
    return await UserModel.findOne({ where: { name } });
  }
  async create(
    name: string,
    password: string,
    isAdmin = false,
    isDeactivate = false,
  ) {
    return await UserModel.create({
      name,
      password,
      isAdmin,
      isDeactivate,
    });
  }
  async getAll() {
    return await UserModel.findAll();
  }
}

export default new UserService();
