require("dotenv").config({ path: ".env" });

import express from "express";
import sequelize from "./db";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import routes from "./routes";
import SocketAuthHandlingMiddleware from "./middleware/SocketAuthHandlingMiddleware";
import errorHandlingMiddleware from "./middleware/ApiErrorMiddleware";

const PORT = process.env.PORT;
const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);
app.use(errorHandlingMiddleware);

const server = createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL },
  serveClient: false,
  transports: ["websocket"],
});
io.use(SocketAuthHandlingMiddleware);
io.on("connect", (socket) => {
  console.log(`new coonect ${socket.id}`);
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();

export { io };
