import { TrelloModel, UserModel } from "../models/models";
import { IColumn } from "../ifaces";

class TrelloService {
  findById(trelloId: number) {
    return TrelloModel.findOne({
      where: { id: trelloId, isDeactivate: false },
    });
  }
  getAll() {
    return TrelloModel.findAll({
      where: { isDeactivate: false },
      include: [UserModel],
    });
  }
  edit(trelloId: number, content: IColumn[]) {
    return TrelloModel.update({ content }, { where: { id: trelloId } });
  }
  async create(trelloName: string, users: number[], createdBy: number) {
    const trello = await TrelloModel.create({
      trelloName,
      content: [],
      createdBy,
      isDeactivate: false,
    });
    await trello.setUsers(users);
    return trello;
  }
}

export default new TrelloService();
