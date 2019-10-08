import { Request, Response, NextFunction } from "express";
import { IUserSchema } from "../../../schemas/User";
import Post, { IPost, IPostSchema } from "../../../schemas/Club/Post";
import SendRule, { StatusError, HTTPRequestCode } from "../../../modules/Send-Rule";
import { IClubSchema, Permission } from "../../../schemas/Club";
import Award, { IAward, IAwardSchema } from "../../../schemas/Club/Award";

export const Write = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body as IAward;
	if (!user.isJoinClub(club)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "소속된 동아리가 아님"));
	} else if (!club.checkPermission(Permission.ACCESS_AWARDS_CREATE, user)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "동아리 내부 권한 없음"));
	}
    let award = new Award(data);
    award.club = club._id;
	award
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
export const GetPublicAwards = function(req: Request, res: Response, next: NextFunction) {
	let club = (req as any).club as IClubSchema;

	club.getClubAwards()
		.then((awards: IAwardSchema[]) => {
			SendRule.response(res, HTTPRequestCode.OK, awards);
		})
		.catch(err => next(err));
};
