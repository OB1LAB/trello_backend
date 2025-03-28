import { UserModel } from "../models/models";

class UserService {
  async getOne(userId: number) {
    return UserModel.findByPk(userId);
  }
  async getOneByName(name: string) {
    return UserModel.findOne({ where: { name } });
  }
  async create(
    name: string,
    password: string,
    isAdmin = false,
    isDeactivate = false,
  ) {
    return UserModel.create({
      name,
      password,
      isAdmin,
      isDeactivate,
    });
  }
  async getAll() {
    return UserModel.findAll();
  }
}

export default new UserService();
