import UserService from "./services/user-service";
import {
  ICacheTrello,
  ICacheUserCreateTrelloList,
  ICacheUserTrelloList,
  IUserInstance,
} from "./ifaces";
import TrelloService from "./services/trello-service";

let users: IUserInstance[] = [];
let trello: ICacheTrello = {};
let userTrelloList: ICacheUserTrelloList = {};
let userCreateTrelloList: ICacheUserCreateTrelloList = {};

const updateTrello = async () => {
  const newTrello: ICacheTrello = {};
  const newUserTrelloList: ICacheUserTrelloList = {};
  const newUserCreateTrelloList: ICacheUserCreateTrelloList = {};
  const trelloList = await TrelloService.getAll();
  for (const trello of trelloList) {
    const accessUsers = trello.users.map((user) => user.id);
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
  users = await UserService.getAll();
};

const getUsers = () => {
  return users;
};

const getTrello = () => {
  return { trello, userTrelloList, userCreateTrelloList };
};

export { getUsers, updateUsers, updateTrello, getTrello };
