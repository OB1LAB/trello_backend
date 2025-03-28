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

export interface ITrelloJson {
  columns: IColumn[];
}

export interface ITrello {
  id: number;
  content: ITrelloJson;
  trelloName: string;
  createdUser?: number;
}
interface TrelloCreation extends Optional<ITrello, "id"> {}
export interface ITrelloInstance
  extends Model<ITrello, TrelloCreation>,
    ITrello {}

interface IUserAuth {
  name: string;
  password: string;
}
