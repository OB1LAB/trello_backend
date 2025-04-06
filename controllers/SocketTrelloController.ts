import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { getTrello } from "../cache";
import { io } from "../index";
import { ServerEvents } from "../consts";
import { IFakeSizeSide } from "../ifaces";

class SocketTrelloController {
  selectTrello(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    trelloId: number,
  ): void {
    try {
      for (const trelloRoom of socket.rooms) {
        if (trelloRoom.startsWith("trello")) {
          socket.leave(trelloRoom);
        }
      }
      socket.join(`trello:${trelloId}`);
      socket.data.user.selectedTrello = trelloId;
    } catch (error) {
      console.log(error);
    }
  }
  addTask(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    executorUserId: number,
    currentDate: Date,
    timeEnd: number,
    content: string,
    color: string,
    columnIndex: number,
  ) {
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
  }
  addColumn(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    title: string,
  ) {
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
  }
  fakeSize(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    taskIndex: number,
    columnIndex: number,
    side: IFakeSizeSide,
    size: number,
    isButtonAddTask: boolean,
  ) {
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
  }
  hover(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    isHover: boolean,
  ) {
    const trelloId: number = socket.data.user.selectedTrello;
    io.to(`trello:${trelloId}`).emit(
      ServerEvents.hovered,
      socket.data.user.id,
      isHover,
    );
  }
  removeColumn(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    columnIndex: number,
  ) {
    const trelloId: number = socket.data.user.selectedTrello;
    io.to(`trello:${trelloId}`).emit(
      ServerEvents.removeColumn,
      socket.data.user.id,
      columnIndex,
    );
    const trello = getTrello().trello[trelloId];
    const columns = trello.trello;
    columns.splice(columnIndex, 1);
  }
  moveTask(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    oldColumnIndex: number,
    newColumnIndex: number,
    oldTaskIndex: number,
    newTaskIndex: number,
  ) {
    const trelloId: number = socket.data.user.selectedTrello;
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
    const trello = getTrello().trello[trelloId];
    const columns = trello.trello;
    const task = columns[oldColumnIndex].tasks.splice(oldTaskIndex, 1)[0];

    columns[newColumnIndex].tasks.splice(newTaskIndex + offset, 0, task);
  }
  moveColumn(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    oldColumnIndex: number,
    newColumnIndex: number,
  ) {
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
  }
}

export default new SocketTrelloController();
