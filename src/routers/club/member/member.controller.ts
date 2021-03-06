import { Request, Response, NextFunction } from "express";
import { IUserSchema } from "../../../schemas/User";
import SendRule, { HTTPRequestCode } from "../../../modules/Send-Rule";
import { IClubSchema } from "../../../schemas/Club";

/**
 * @description 모든 공개 글을 반환하는 라우터 입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const GetPublicMembers = function(req: Request, res: Response, next: NextFunction) {
	let club = (req as any).club as IClubSchema;

	club.getClubMembers()
		.then((users: IUserSchema[]) => {
			SendRule.response(res, HTTPRequestCode.OK, users);
		})
		.catch(err => next(err));
};

export const GetDetailMembers = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;

	let club = (req as any).club as IClubSchema;
	if (club.checkAdmin(user))
		club.getDetailMembers()
			.then(members => {
				SendRule.response(res, HTTPRequestCode.OK, members);
			})
			.catch(err => next(err));
	else SendRule.response(res, HTTPRequestCode.FORBIDDEN, undefined, "권한 없음");
};
