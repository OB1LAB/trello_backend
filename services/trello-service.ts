import { TrelloModel, UserModel } from "../models/models";

class TrelloService {
  getAll() {
    return TrelloModel.findAll({
      include: [UserModel],
    });
  }
  async create(trelloName: string, users: number[], createdBy: number) {
    const trello = await TrelloModel.create({
      trelloName,
      content: [],
      createdBy,
    });
    await trello.setUsers(users);
    return trello;
  }
}

export default new TrelloService();
