import { SocketRouter } from "../../socket.index";
import * as SocketIO from "socket.io";
import Club from "../../../schemas/Club";
import Logger from "../../../modules/Logger";

type clubnameRequest = { clubname: string; members?: any[] };
type AttendanceResponse = { result: boolean; message: string; data?: any };
class Attendance {
	clubname: string;
	members: any[];
	constructor(clubname, members) {
		this.clubname = clubname;
		this.members = members;
	}
	setMembers(members: any[]) {
		this.members = members;
	}
}

class AttendanceManager {
	attendances: Attendance[];
	constructor() {
		this.attendances = [] as Attendance[];
	}
	/**
	 * @description 중복이 있을경우 0, 중복이 없을경우 1을 반환
	 * @param clubname 동아리 이름
	 */
	checkRedundancy(clubname: string) {
		return this.attendances.findIndex(attendance => attendance.clubname == clubname) == -1;
	}
	createAttendance(clubname: string, member: any[]): Attendance {
		let attendance = new Attendance(clubname, member);
		this.attendances.push(attendance);
		return attendance;
	}
	deleteAttendance(clubname: string): void {
		this.attendances.splice(
			this.attendances.findIndex(attendance => attendance.clubname == clubname),
			1
		);
	}
	getAttendance(clubname: string): Attendance {
		return this.attendances.find(attendance => attendance.clubname == clubname);
	}
}
let attendanceManager = new AttendanceManager();

const socketRouter: SocketRouter = (io: SocketIO.Server, socket: SocketIO.Socket): void => {
	socket.on("attendance_createAttendance", (data: clubnameRequest) => {
		if (!attendanceManager.checkRedundancy(data.clubname)) {
			socket.emit("attendance_createAttendance", { result: false, message: "이미 생성된 출석입니다." } as AttendanceResponse);
		} else {
			let attendance = attendanceManager.createAttendance(data.clubname, data.members);
			socket.leaveAll();
			socket.join(data.clubname);
			io.sockets.in(data.clubname).emit("attendance_createAttendance", { result: true, message: "면접 생성 성공", data: attendance } as AttendanceResponse);
		}
	});
	socket.on("attendance_deleteAttendance", (data: clubnameRequest) => {
		if (!attendanceManager.checkRedundancy(data.clubname)) {
			attendanceManager.deleteAttendance(data.clubname);
			io.sockets.in(data.clubname).emit("attendance_deleteAttendance", { result: true, message: "면접 종료 성공" } as AttendanceResponse);
		} else {
			socket.emit("attendance_deleteAttendance", { result: false, message: "면접이 없습니다." } as AttendanceResponse);
		}
	});
	socket.on("attendance_getAttendanceByClubName", (data: clubnameRequest) => {
		socket.leaveAll();
		socket.join(data.clubname);
		if (!attendanceManager.checkRedundancy(data.clubname)) {
			socket.emit("attendance_getAttendanceByClubName", { result: true, message: "면접 가져오기 성공", data: attendanceManager.getAttendance(data.clubname) } as AttendanceResponse);
		} else {
			socket.emit("attendance_getAttendanceByClubName", { result: false, message: "면접이 없습니다." } as AttendanceResponse);
		}
	});
	socket.on("attendance_updateAttendance", (data: clubnameRequest) => {
		if (!attendanceManager.checkRedundancy(data.clubname)) {
			let attendance: Attendance = attendanceManager.getAttendance(data.clubname);
			attendance.setMembers(data.members);
			socket.broadcast.in(data.clubname).emit("attendance_updateAttendance", { result: true, message: "면접 갱신 성공", data: attendance } as AttendanceResponse);
		} else {
			socket.emit("attendance_updateAttendance", { result: false, message: "면접이 없습니다." } as AttendanceResponse);
		}
	});
};

export default socketRouter;
