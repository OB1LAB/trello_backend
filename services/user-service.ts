import { UserModel } from "../models/models";

class UserService {
  getOne(userId: number) {
    return UserModel.findByPk(userId);
  }
  getOneByName(name: string) {
    return UserModel.findOne({ where: { name } });
  }
  create(
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
  editUser(userId: number, isAdmin: boolean, password?: string) {
    if (!password) {
      return UserModel.update({ isAdmin }, { where: { id: userId } });
    }
    return UserModel.update({ isAdmin, password }, { where: { id: userId } });
  }
  changePassword(userId: number, newPassword: string) {
    return UserModel.update(
      { password: newPassword },
      { where: { id: userId } },
    );
  }
  getAll() {
    return UserModel.findAll();
  }
}

export default new UserService();
