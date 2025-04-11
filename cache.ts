import UserService from "./services/user-service";
import TrelloService from "./services/trello-service";
import {
  ICacheTrello,
  ICacheUserCreateTrelloList,
  ICacheUserObject,
  ICacheUserTrelloList,
} from "./ifaces";

let users: ICacheUserObject = {
  admin: [],
  user: [],
};
let trello: ICacheTrello = {};
let userTrelloList: ICacheUserTrelloList = {};
let userCreateTrelloList: ICacheUserCreateTrelloList = {};

const updateTrello = async () => {
  const newTrello: ICacheTrello = {};
  const newUserTrelloList: ICacheUserTrelloList = {};
  const newUserCreateTrelloList: ICacheUserCreateTrelloList = {};
  const trelloList = await TrelloService.getAll();
  for (const trello of trelloList) {
    const accessUsers = trello.users
      .filter((user) => !user.isDeactivate)
      .map((user) => user.id);
    newTrello[trello.id] = {
      trello: trello.content,
      createdUser: trello.createdBy,
      accessUsers,
      trelloName: trello.trelloName,
    };
    if (
      !Object.keys(newUserCreateTrelloList).includes(
        trello.createdBy.toString(),
      )
    ) {
      newUserCreateTrelloList[trello.createdBy] = [];
    }
    newUserCreateTrelloList[trello.createdBy].push(trello.id);
    for (const member of accessUsers) {
      if (!Object.keys(newUserTrelloList).includes(member.toString())) {
        newUserTrelloList[member] = [];
      }
      newUserTrelloList[member].push(trello.id);
    }
  }
  trello = newTrello;
  userTrelloList = newUserTrelloList;
  userCreateTrelloList = newUserCreateTrelloList;
};

const updateUsers = async () => {
  users = {
    admin: [],
    user: [],
  };
  const dbUsers = await UserService.getAll();
  for (const user of dbUsers) {
    users.admin.push({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      createdByUserId: user.createdByUserId,
    });
    users.user.push({
      id: user.id,
      name: user.name,
    });
  }
};

const saveTrelloDb = async (trelloId: number) => {
  await TrelloService.edit(trelloId, trello[trelloId].trello);
};

const getUsers = () => {
  return users;
};

const getTrello = () => {
  return { trello, userTrelloList, userCreateTrelloList };
};

export { getUsers, updateUsers, updateTrello, getTrello, saveTrelloDb };
