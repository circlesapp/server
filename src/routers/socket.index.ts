import { Server } from "https";
import * as SocketIO from "socket.io";

import Log from "../modules/Logger";

export default function(server: Server) {
	const io = SocketIO(server, { origins: "*:*" });

	io.on("connection", socket => {
		Log.d("Connect Socket IO");
		socket.on("msg", data => {
			Log.d(data);
			socket.emit(data);
		});
	});

	return io;
}
