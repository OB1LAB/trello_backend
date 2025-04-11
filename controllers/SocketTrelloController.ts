import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getTrello, saveTrelloDb } from "../cache";
import { io } from "../index";
import { ServerEvents } from "../consts";
import { IFakeSizeSide } from "../ifaces";

class SocketTrelloController {
  selectTrello(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    trelloId: number,
  ): void {
    try {
      const { userTrelloList, userCreateTrelloList } = getTrello();
      if (
        Object.keys(userTrelloList).includes(socket.data.user.id.toString()) ||
        Object.keys(userCreateTrelloList).includes(
          socket.data.user.id.toString(),
        )
      ) {
        for (const trelloRoom of socket.rooms) {
          if (trelloRoom.startsWith("trello")) {
            socket.leave(trelloRoom);
          }
        }
        socket.join(`trello:${trelloId}`);
        socket.data.user.selectedTrello = trelloId;
      }
    } catch (error) {
      console.log(error);
    }
  }
  async addTask(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    executorUserId: number,
    currentDate: Date,
    timeEnd: number,
    content: string,
    color: string,
    columnIndex: number,
  ) {
    try {
      const trelloId: number = socket.data.user.selectedTrello;
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.addTask,
        socket.data.user.id,
        columnIndex,
        {
          createdUserId: socket.data.user.id,
          executorUserId:
            executorUserId === -1 ? socket.data.user.id : executorUserId,
          dateCreate: currentDate,
          timeEnd,
          content,
          color,
        },
      );
      const trello = getTrello().trello[trelloId];
      const columns = trello.trello;
      columns[columnIndex].tasks.push({
        createdUserId: socket.data.user.id,
        executorUserId:
          executorUserId === -1 ? socket.data.user.id : executorUserId,
        dateCreate: currentDate,
        timeEnd,
        content,
        color,
      });
      await saveTrelloDb(trelloId);
    } catch (error) {
      console.log(error);
    }
  }
  async editTask(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    executorUserId: number,
    timeEnd: number,
    content: string,
    color: string,
    columnIndex: number,
    taskIndex: number,
  ) {
    try {
      const trelloId: number = socket.data.user.selectedTrello;
      const trello = getTrello().trello[trelloId];
      const columns = trello.trello;
      if (
        !(
          socket.data.user.isAdmin ||
          columns[columnIndex].tasks[taskIndex].createdUserId ===
            socket.data.user.id
        )
      ) {
        return;
      }
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.editTask,
        socket.data.user.id,
        executorUserId === -1 ? socket.data.user.id : executorUserId,
        timeEnd,
        content,
        color,
        columnIndex,
        taskIndex,
      );
      columns[columnIndex].tasks[taskIndex] = {
        ...columns[columnIndex].tasks[taskIndex],
        executorUserId:
          executorUserId === -1 ? socket.data.user.id : executorUserId,
        timeEnd,
        content,
        color,
      };
      await saveTrelloDb(trelloId);
    } catch (error) {
      console.log(error);
    }
  }
  async editColumn(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    title: string,
    columnIndex: number,
  ) {
    try {
      if (!socket.data.user.isAdmin) {
        return;
      }
      const trelloId: number = socket.data.user.selectedTrello;
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.editColumn,
        socket.data.user.id,
        title,
        columnIndex,
      );
      const trello = getTrello().trello[trelloId];
      const columns = trello.trello;
      columns[columnIndex].title = title;
      await saveTrelloDb(trelloId);
    } catch (error) {
      console.log(error);
    }
  }
  async addColumn(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    title: string,
  ) {
    try {
      if (!socket.data.user.isAdmin) {
        return;
      }
      const trelloId: number = socket.data.user.selectedTrello;
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.addColumn,
        socket.data.user.id,
        title,
      );
      const trello = getTrello().trello[trelloId];
      const columns = trello.trello;
      columns.push({
        title,
        tasks: [],
      });
      await saveTrelloDb(trelloId);
    } catch (error) {
      console.log(error);
    }
  }
  fakeSize(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    taskIndex: number,
    columnIndex: number,
    side: IFakeSizeSide,
    size: number,
    isButtonAddTask: boolean,
  ) {
    try {
      const trelloId: number = socket.data.user.selectedTrello;
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.fakeSize,
        socket.data.user.id,
        taskIndex,
        columnIndex,
        side,
        size,
        isButtonAddTask,
      );
    } catch (error) {
      console.log(error);
    }
  }
  hover(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    isHover: boolean,
  ) {
    try {
      const trelloId: number = socket.data.user.selectedTrello;
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.hovered,
        socket.data.user.id,
        isHover,
      );
    } catch (error) {
      console.log(error);
    }
  }
  async removeColumn(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    columnIndex: number,
    taskIndex: number,
  ) {
    try {
      const trelloId: number = socket.data.user.selectedTrello;
      if (!socket.data.user.isAdmin) {
        return;
      }
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.removeColumn,
        socket.data.user.id,
        columnIndex,
        taskIndex,
      );
      const trello = getTrello().trello[trelloId];
      const columns = trello.trello;
      if (taskIndex === -1) {
        columns.splice(columnIndex, 1);
      } else {
        columns[columnIndex].tasks.splice(taskIndex, 1);
      }
      await saveTrelloDb(trelloId);
    } catch (error) {
      console.log(error);
    }
  }
  async moveTask(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    oldColumnIndex: number,
    newColumnIndex: number,
    oldTaskIndex: number,
    newTaskIndex: number,
  ) {
    try {
      const trelloId: number = socket.data.user.selectedTrello;
      const trello = getTrello().trello[trelloId];
      const columns = trello.trello;
      if (
        !(
          socket.data.user.isAdmin ||
          columns[oldColumnIndex].tasks[oldColumnIndex].createdUserId ===
            socket.data.user.id
        )
      ) {
        return;
      }
      const offset =
        oldColumnIndex === newColumnIndex
          ? newTaskIndex > oldTaskIndex
            ? -1
            : 0
          : 0;
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.moveTask,
        socket.data.user.id,
        oldColumnIndex,
        newColumnIndex,
        oldTaskIndex,
        newTaskIndex,
        offset,
      );
      const task = columns[oldColumnIndex].tasks.splice(oldTaskIndex, 1)[0];
      columns[newColumnIndex].tasks.splice(newTaskIndex + offset, 0, task);
      await saveTrelloDb(trelloId);
    } catch (error) {
      console.log(error);
    }
  }
  async moveColumn(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    oldColumnIndex: number,
    newColumnIndex: number,
  ) {
    try {
      if (!socket.data.user.isAdmin) {
        return;
      }
      const trelloId: number = socket.data.user.selectedTrello;
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.moveColumn,
        socket.data.user.id,
        oldColumnIndex,
        newColumnIndex,
      );
      const trello = getTrello().trello[trelloId];
      const columns = trello.trello;
      columns.splice(newColumnIndex, 0, columns[oldColumnIndex]);
      columns.splice(
        oldColumnIndex + (oldColumnIndex > newColumnIndex ? 1 : 0),
        1,
      );
      await saveTrelloDb(trelloId);
    } catch (error) {
      console.log(error);
    }
  }
  grabTask(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    columnIndex: number,
    taskIndex: number,
    xOffset: number,
    yOffset: number,
    x: number,
    y: number,
    isMove: boolean,
  ) {
    try {
      const trelloId: number = socket.data.user.selectedTrello;
      io.to(`trello:${trelloId}`).emit(
        ServerEvents.grabTask,
        socket.data.user.id,
        columnIndex,
        taskIndex,
        xOffset,
        yOffset,
        x,
        y,
        isMove,
      );
    } catch (error) {
      console.log(error);
    }
  }
}

export default new SocketTrelloController();
