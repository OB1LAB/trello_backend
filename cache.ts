import UserService from "./services/user-service";
import {
  ICacheTrello,
  ICacheUserCreateTrelloList,
  ICacheUserTrelloList,
  IUserInstance,
} from "./ifaces";
import TrelloService from "./services/trello-service";
import TokenService from "./services/token-service";
import tokenService from "./services/token-service";

let users: IUserInstance[] = [];
let trello: ICacheTrello = {};
let userTrelloList: ICacheUserTrelloList = {};
let userCreateTrelloList: ICacheUserCreateTrelloList = {};
const tokens: { [token: string]: string } = {};

const updateSocketToken = (primaryToken: string) => {
  let oldToken;
  if (Object.keys(tokens).includes(primaryToken)) {
    oldToken = tokens[primaryToken];
  } else {
    oldToken = primaryToken;
  }
  const user = tokenService.validateAccessToken(oldToken);
  if (!user) {
    return null;
  }
  const { accessToken } = TokenService.generateTokens(
    user.userName,
    user.id,
    user.isAdmin,
  );
  tokens[primaryToken] = accessToken;
  return accessToken;
};

const getSocketToken = (primaryToken: string) => {
  if (!Object.keys(primaryToken).includes(primaryToken)) {
    tokens[primaryToken] = primaryToken;
  }
  return tokens[primaryToken];
};

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

export {
  getUsers,
  updateUsers,
  updateTrello,
  getTrello,
  getSocketToken,
  updateSocketToken,
};
