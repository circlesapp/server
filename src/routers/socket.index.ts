// import { Server } from "https";
import { Server } from "http";
import * as SocketIO from "socket.io";

import Log from "../modules/Logger";

import SocketInterview from "./club/interview/interview.socket";
import SocketAtendance from "./club/attendance/attendance.socket";

export type SocketRouter = (io: SocketIO.Server, socket: SocketIO.Socket) => void;

class SocketIOManager {
  io: SocketIO.Server;
  socketRouters: SocketRouter[];
  constructor() {
    this.socketRouters = [] as SocketRouter[];
  }
  use(socketRouter: SocketRouter) {
    this.socketRouters.push(socketRouter);
  }
  start(server: Server) {
    this.io = SocketIO(server, { origins: "*:*" });
    this.io.on("connection", socket => {
      Log.d("SOCKET CONNECT");
      this.socketRouters.forEach(socketRouter => socketRouter(this.io, socket));
    });
  }
}
const socketIOManager = new SocketIOManager();
socketIOManager.use(SocketInterview);
socketIOManager.use(SocketAtendance);

export default socketIOManager;
