import { SocketRouter } from "../../socket.index";
import * as SocketIO from "socket.io";
import Club from "../../../schemas/Club";
import Logger from "../../../modules/Logger";

type clubnameRequest = { clubname: string; interviewers?: Interviewer[] };
type InterviewResponse = { result: boolean; message: string; data?: any };
type Interviewer = { name: string; number: string };
class Attendance {
	clubname: string;
	interviewers: Interviewer[];
	constructor(clubname, interviewers) {
		this.clubname = clubname;
		this.interviewers = interviewers;
	}
	setInterviewers(interviewers: Interviewer[]) {
		this.interviewers = interviewers;
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
		return this.attendances.findIndex(interviewRoom => interviewRoom.clubname == clubname) == -1;
	}
	createAttendance(clubname: string, interviewers: Interviewer[]): Attendance {
		let interview = new Attendance(clubname, interviewers);
		this.attendances.push(interview);
		return interview;
	}
	deleteAttendance(clubname: string): void {
		this.attendances.splice(
			this.attendances.findIndex(interviewRoom => interviewRoom.clubname == clubname),
			1
		);
	}
	getAttendance(clubname: string): Attendance {
		return this.attendances.find(interviewRoom => interviewRoom.clubname == clubname);
	}
}
let attendanceManager = new AttendanceManager();

const socketRouter: SocketRouter = (io: SocketIO.Server, socket: SocketIO.Socket): void => {
	socket.on("attendance_createAttendance", (data: clubnameRequest) => {
		if (!attendanceManager.checkRedundancy(data.clubname)) {
			socket.emit("attendance_createAttendance", { result: false, message: "이미 생성된 출석입니다." } as InterviewResponse);
		} else {
			let interview = attendanceManager.createAttendance(data.clubname, data.interviewers);
			socket.leaveAll();
			socket.join(data.clubname);
			io.sockets.in(data.clubname).emit("attendance_createAttendance", { result: true, message: "면접 생성 성공", data: interview } as InterviewResponse);
		}
	});
	socket.on("attendance_deleteAttendance", (data: clubnameRequest) => {
		if (!attendanceManager.checkRedundancy(data.clubname)) {
			attendanceManager.deleteAttendance(data.clubname);
			io.sockets.in(data.clubname).emit("attendance_deleteAttendance", { result: true, message: "면접 종료 성공" } as InterviewResponse);
		} else {
			socket.emit("attendance_deleteAttendance", { result: false, message: "면접이 없습니다." } as InterviewResponse);
		}
	});
	socket.on("attendance_getAttendanceByClubName", (data: clubnameRequest) => {
		socket.leaveAll();
		socket.join(data.clubname);
		if (!attendanceManager.checkRedundancy(data.clubname)) {
			socket.emit("attendance_getAttendanceByClubName", { result: true, message: "면접 가져오기 성공", data: attendanceManager.getAttendance(data.clubname) } as InterviewResponse);
		} else {
			socket.emit("attendance_getAttendanceByClubName", { result: false, message: "면접이 없습니다." } as InterviewResponse);
		}
	});
	socket.on("attendance_updateAttendance", (data: clubnameRequest) => {
		if (!attendanceManager.checkRedundancy(data.clubname)) {
			let interview: Attendance = attendanceManager.getAttendance(data.clubname);
			interview.setInterviewers(data.interviewers);
			socket.broadcast.in(data.clubname).emit("attendance_updateAttendance", { result: true, message: "면접 갱신 성공", data: interview } as InterviewResponse);
		} else {
			socket.emit("attendance_updateAttendance", { result: false, message: "면접이 없습니다." } as InterviewResponse);
		}
	});
};

export default socketRouter;
