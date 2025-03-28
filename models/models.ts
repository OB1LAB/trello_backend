import sequelize from "../db";
import { DataTypes } from "sequelize";
import { ITokenInstance, ITrelloInstance, IUserInstance } from "../ifaces";

const UserModel = sequelize.define<IUserInstance>(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDeactivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: false },
);

const TokenModel = sequelize.define<ITokenInstance>(
  "token",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: false },
);

const TrelloModel = sequelize.define<ITrelloInstance>(
  "trello",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trelloName: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.JSONB,
    },
  },
  { timestamps: false },
);

UserModel.hasMany(TokenModel);
TokenModel.belongsTo(UserModel);

const User_TrelloPermission = sequelize.define(
  "User_TrelloPermission",
  {},
  { timestamps: false },
);

UserModel.belongsToMany(TrelloModel, { through: User_TrelloPermission });
TrelloModel.belongsToMany(UserModel, { through: User_TrelloPermission });

export { UserModel, TokenModel, TrelloModel };
