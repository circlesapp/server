import { Server } from "https";
import * as SocketIO from "socket.io";

import Log from "../modules/Logger";

import SocketInterview from "./club/interview/interview.socket";

export type SocketRouter = (io: SocketIO.Server, socket: SocketIO.Socket) => void;

class SocketIOManager {
	io: SocketIO.Server;
	socketRouters: SocketRouter[];
	constructor() {}
	use(socketRouter: SocketRouter) {
		this.socketRouters.push(socketRouter);
	}
	start(server: Server) {
		this.io = SocketIO(server, { origins: "*:*" });
		this.io.on("connection", socket => {
			this.socketRouters.forEach(socketRouter => socketRouter(this.io, socket));
			socket.on("setClub", data => {});
		});
	}
}
const socketIOManager = new SocketIOManager();
socketIOManager.use(SocketInterview);

export default socketIOManager;
