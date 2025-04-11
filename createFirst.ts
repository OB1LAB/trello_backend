require("dotenv").config({ path: ".env" });
import bcrypt from "bcrypt";
import userService from "./services/user-service";
import "./db";

const create = async () => {
  const hashedPassword = bcrypt.hashSync("1234", 10);
  await userService.create("OB1CHAM", hashedPassword, true, -1);
  console.log("created");
};

create();
