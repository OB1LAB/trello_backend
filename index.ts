import { ServerEvents } from "./consts";

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
import { updateUsers, updateTrello } from "./cache";
import SocketTrelloController from "./controllers/SocketTrelloController";
import { IFakeSizeSide } from "./ifaces";

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
io.on("connection", (socket) => {
  socket.on(ServerEvents.selectTrello, (trelloId) => {
    SocketTrelloController.selectTrello(socket, trelloId);
  });
  socket.on(
    ServerEvents.addTask,
    (
      executorUserId: number,
      currentDate: Date,
      timeEnd: number,
      content: string,
      color: string,
      columnIndex: number,
    ) => {
      SocketTrelloController.addTask(
        socket,
        executorUserId,
        currentDate,
        timeEnd,
        content,
        color,
        columnIndex,
      );
    },
  );
  socket.on(ServerEvents.addColumn, (title: string) => {
    SocketTrelloController.addColumn(socket, title);
  });
  socket.on(
    ServerEvents.grabTask,
    (
      columnIndex: number,
      taskIndex: number,
      xOffset: number,
      yOffset: number,
      x: number,
      y: number,
      isMove: boolean,
    ) => {
      SocketTrelloController.grabTask(
        socket,
        columnIndex,
        taskIndex,
        xOffset,
        yOffset,
        x,
        y,
        isMove,
      );
    },
  );
  socket.on(
    ServerEvents.moveColumn,
    (oldColumnIndex: number, newColumnIndex: number) => {
      SocketTrelloController.moveColumn(socket, oldColumnIndex, newColumnIndex);
    },
  );
  socket.on(ServerEvents.removeColumn, (columnIndex: number) => {
    SocketTrelloController.removeColumn(socket, columnIndex);
  });
  socket.on(
    ServerEvents.fakeSize,
    (
      taskIndex: number,
      columnIndex: number,
      side: IFakeSizeSide,
      size: number,
      isButtonAddTask: boolean,
    ) => {
      SocketTrelloController.fakeSize(
        socket,
        taskIndex,
        columnIndex,
        side,
        size,
        isButtonAddTask,
      );
    },
  );
  socket.on(ServerEvents.hovered, (isHover: boolean) => {
    SocketTrelloController.hover(socket, isHover);
  });
  socket.on(
    ServerEvents.moveTask,
    (
      oldColumnIndex: number,
      newColumnIndex: number,
      oldTaskIndex: number,
      newTaskIndex: number,
    ) => {
      SocketTrelloController.moveTask(
        socket,
        oldColumnIndex,
        newColumnIndex,
        oldTaskIndex,
        newTaskIndex,
      );
    },
  );
});

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    server.listen(PORT, async () => {
      console.log(`Server started on port ${PORT}`);
      await Promise.all([updateUsers(), updateTrello()]);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

export { io };
