import { Request, Response, NextFunction } from "express";
import { IUserSchema } from "../../../schemas/User";
import { IClubSchema, Permission } from "../../../schemas/Club";
import Calendar, { ICalendar, ICalendarSchema } from "../../../schemas/Club/Calendar";
import SendRule, { HTTPRequestCode, StatusError } from "../../../modules/Send-Rule";

export const Write = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body as ICalendar;
	if (!user.isJoinClub(club)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "소속된 동아리가 아님"));
	} else if (!club.checkPermission(Permission.ACCESS_CALENDAR_CREATE, user)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "동아리 내부 권한 없음"));
	}
	let calendar = new Calendar(data);
	calendar.club = club._id;
	calendar
		.save()
		.then(award => {
			SendRule.response(res, HTTPRequestCode.CREATE, award, "상 작성 성공");
		})
		.catch(err => next(err));
};

/**
 * @description 모든 공개 글을 반환하는 라우터 입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const GetPublicCalendars = function(req: Request, res: Response, next: NextFunction) {
	let club = (req as any).club as IClubSchema;

	club.getClubCalendars()
		.then((awards: ICalendarSchema[]) => {
			SendRule.response(res, HTTPRequestCode.OK, awards);
		})
		.catch(err => next(err));
};

export const Delete = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body;

	if (!user.isJoinClub(club)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "소속된 동아리가 아님"));
	} else if (!club.checkPermission(Permission.ACCESS_CALENDAR_DELETE, user)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "동아리 내부 권한 없음"));
	}
	if (!("_id" in data)) {
		return next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
	Calendar.findOne({ _id: data._id }).then(calendar => {
		calendar
			.remove()
			.then(calendar => {
				SendRule.response(res, HTTPRequestCode.OK, calendar, "글 제거 성공");
			})
			.catch(err => next(err));
	});
};
