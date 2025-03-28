import { Sequelize } from "sequelize";
export default new Sequelize(
  // @ts-ignore
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false,
  },
);
