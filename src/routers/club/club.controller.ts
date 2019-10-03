import { Response, Request, NextFunction } from "express";
import { IUserSchema } from "../../schemas/User";
import Club from "../../schemas/Club";
import SendRule from "../../modules/Send-Rule";

export const Create = (req: Request, res: Response, next: NextFunction) => {
	let user = req.user as IUserSchema;
	Club.createClub(user, req.body)
		.then(club => {
			SendRule.response(res, 200, club, "동아리 생성 성공");
		})
		.catch(err => next(err));
};
