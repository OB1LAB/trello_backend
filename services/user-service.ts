import { UserModel } from "../models/models";

class UserService {
  getOne(userId: number) {
    return UserModel.findOne({ where: { id: userId, isDeactivate: false } });
  }
  getOneByName(name: string) {
    return UserModel.findOne({ where: { name, isDeactivate: false } });
  }
  create(
    name: string,
    password: string,
    isAdmin = false,
    createdByUserId: number,
  ) {
    return UserModel.create({
      name,
      password,
      isAdmin,
      isDeactivate: false,
      createdByUserId,
    });
  }
  editUser(
    userId: number,
    isAdmin: boolean,
    password?: string,
    isDeactivate?: boolean,
  ) {
    if (isDeactivate) {
      return UserModel.update({ isDeactivate }, { where: { id: userId } });
    }
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
    return UserModel.findAll({ where: { isDeactivate: false } });
  }
}

export default new UserService();
