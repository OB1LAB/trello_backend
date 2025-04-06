import { Model, Optional } from "sequelize";

export interface IUser {
  id: number;
  name: string;
  password: string;
  isAdmin: boolean;
  isDeactivate: boolean;
}
interface UserCreation extends Optional<IUser, "id"> {}
export interface IUserInstance extends Model<IUser, UserCreation>, IUser {}

export interface IToken {
  id: number;
  refreshToken: string;
  userId?: number;
}
interface TokenCreation extends Optional<IToken, "id"> {}
export interface ITokenInstance extends Model<IToken, TokenCreation>, IToken {}

interface ITask {
  createdUserId: number;
  executorUserId: number;
  dateCreate: Date;
  timeEnd: number;
  content: string;
  color: string;
}

interface IColumn {
  title: string;
  tasks: ITask[];
}

export interface ITrello {
  id: number;
  content: IColumn[];
  trelloName: string;
  createdBy: number;
}

export interface ICacheTrello {
  [trelloId: number]: {
    accessUsers: number[];
    createdUser: number;
    trello: IColumn[];
    trelloName: string;
  };
}

export interface ICacheUserTrelloList {
  [userId: number]: number[];
}

export interface ICacheUserCreateTrelloList {
  [userId: number]: number[];
}

interface TrelloCreation extends Optional<ITrello, "id"> {}
export interface ITrelloInstance
  extends Model<ITrello, TrelloCreation>,
    ITrello {
  users: IUser[];
  setUsers: (users: number[]) => Promise<void>;
}

export type IFakeSizeSide = "top" | "right" | "bottom" | "left";

interface IUserAuth {
  name: string;
  password: string;
}
