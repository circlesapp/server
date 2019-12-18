import { SocketRouter } from "../../socket.index";
import * as SocketIO from "socket.io";
import Club from "../../../schemas/Club";
import Logger from "../../../modules/Logger";

type clubnameRequest = { clubname: string; interviewers?: Interviewer[] };
type InterviewResponse = { result: boolean; message: string; data?: any };
type Interviewer = { name: string; number: string };
class InterviewRoom {
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

class InterviewRoomManager {
	interviewRooms: InterviewRoom[];
	constructor() {
		this.interviewRooms = [] as InterviewRoom[];
	}
	/**
	 * @description 중복이 있을경우 0, 중복이 없을경우 1을 반환
	 * @param clubname 동아리 이름
	 */
	checkRedundancy(clubname: string) {
		return this.interviewRooms.findIndex(interviewRoom => interviewRoom.clubname == clubname) == -1;
	}
	startInterview(clubname: string, interviewers: Interviewer[]): InterviewRoom {
		let interview = new InterviewRoom(clubname, interviewers);
		this.interviewRooms.push(interview);
		return interview;
	}
	closeInterview(clubname: string): void {
		this.interviewRooms.splice(
			this.interviewRooms.findIndex(interviewRoom => interviewRoom.clubname == clubname),
			1
		);
	}
	getInterview(clubname: string): InterviewRoom {
		return this.interviewRooms.find(interviewRoom => interviewRoom.clubname == clubname);
	}
}
let interviewRoomManager = new InterviewRoomManager();

const socketRouter: SocketRouter = (io: SocketIO.Server, socket: SocketIO.Socket): void => {
	socket.on("interview_startInterview", (data: clubnameRequest) => {
		if (!interviewRoomManager.checkRedundancy(data.clubname)) {
			socket.emit("interview_startInterview", { result: false, message: "이미 시작된 면접입니다." } as InterviewResponse);
		} else {
			let interview = interviewRoomManager.startInterview(data.clubname, data.interviewers);
			io.sockets.in(data.clubname).emit("interview_startInterview", { result: true, message: "면접 생성 성공", data: interview } as InterviewResponse);
		}
	});
	socket.on("interview_closeInterview", (data: clubnameRequest) => {
		if (!interviewRoomManager.checkRedundancy(data.clubname)) {
			interviewRoomManager.closeInterview(data.clubname);
			io.sockets.in(data.clubname).emit("interview_closeInterview", { result: true, message: "면접 종료 성공" } as InterviewResponse);
		} else {
			socket.emit("interview_closeInterview", { result: false, message: "면접이 없습니다." } as InterviewResponse);
		}
	});
	socket.on("interview_getInterviewByClubName", (data: clubnameRequest) => {
		if (!interviewRoomManager.checkRedundancy(data.clubname)) {
			socket.join(data.clubname);
			socket.emit("interview_getInterviewByClubName", { result: true, message: "면접 가져오기 성공", data: interviewRoomManager.getInterview(data.clubname) } as InterviewResponse);
		} else {
			socket.emit("interview_getInterviewByClubName", { result: false, message: "면접이 없습니다." } as InterviewResponse);
		}
	});
	socket.on("interview_updateInterviewers", (data: clubnameRequest) => {
		if (!interviewRoomManager.checkRedundancy(data.clubname)) {
			let interview: InterviewRoom = interviewRoomManager.getInterview(data.clubname);
			interview.setInterviewers(data.interviewers);
			socket.broadcast.in(data.clubname).emit("interview_updateInterviewers", { result: true, message: "면접 갱신 성공", data: interview } as InterviewResponse);
		} else {
			socket.emit("interview_updateInterviewers", { result: false, message: "면접이 없습니다." } as InterviewResponse);
		}
	});
};

export default socketRouter;
