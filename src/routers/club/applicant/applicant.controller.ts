import { NextFunction, Response, Request } from "express";
import User, { IUserSchema } from "../../../schemas/User";
import { IClubSchema } from "../../../schemas/Club";
import Applicant, { IApplicant } from "../../../schemas/Club/Applicant";
import SendRule, { HTTPRequestCode, StatusError } from "../../../modules/Send-Rule";

export const Apply = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body as IApplicant;
	data.club = club._id;
	data.owner = user._id;
	if (user.isJoinClub(club)) {
		return next(new StatusError(HTTPRequestCode.BAD_REQUEST, "이미 가입 된 동아리"));
	}
	Applicant.getApplicantByUser(club, user)
		.then(applicant => {
			if (applicant) {
				return next(new StatusError(HTTPRequestCode.BAD_REQUEST, "이미 작성 된 지원서"));
			} else {
				let applicant = new Applicant(data);
				applicant
					.save()
					.then(applicant => {
						user.pushApplicant(applicant)
							.then(user => {
								SendRule.response(res, HTTPRequestCode.CREATE, applicant, "지원서 작성 성공");
							})
							.catch(err => next(err));
					})
					.catch(err => next(err));
			}
		})
		.catch(err => next(err));
};

export const Modification = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body as IApplicant;
	Applicant.getApplicantByUser(club, user).then(applicant => {
		if (applicant) {
			applicant
				.changeInfomation(data)
				.then(applicant => {
					SendRule.response(res, HTTPRequestCode.OK, applicant, "지원서 수정 성공");
				})
				.catch(err => next(err));
		} else {
			return next(new StatusError(HTTPRequestCode.NOT_FOUND, "작성 된 지원서가 없음"));
		}
	});
};
//
export const GetClubApplications = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	if (club.checkAdmin(user)) {
		club.getClubApplicants()
			.then(applications => {
				SendRule.response(res, HTTPRequestCode.CREATE, applications);
			})
			.catch(err => next(err));
	} else {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "권한 없음"));
	}
};

export const GetMyApplicant = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	if (user.isJoinClub(club)) {
		return next(new StatusError(HTTPRequestCode.BAD_REQUEST, "이미 가입 된 동아리"));
	} else {
		Applicant.getApplicantByUser(club, user)
			.then(applicant => {
				if (applicant) {
					SendRule.response(res, HTTPRequestCode.CREATE, applicant, "지원서 작성 성공");
				} else {
					return next(new StatusError(HTTPRequestCode.NOT_FOUND, "작성 된 지원서가 없음"));
				}
			})
			.catch(err => next(err));
	}
};
export const Accept = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body;

	if (club.checkAdmin(user)) {
		club.acceptApplicant(data._id)
			.then(applicant => {
				SendRule.response(res, HTTPRequestCode.CREATE, applicant, "지원서 수락 성공");
			})
			.catch(err => next(err));
	} else {
		return SendRule.response(res, HTTPRequestCode.FORBIDDEN, undefined, "권한 없음");
	}
};

export const Reject = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body;

	if (club.checkAdmin(user)) {
		club.rejectApplicant(data._id)
			.then(applicant => {
				SendRule.response(res, HTTPRequestCode.CREATE, applicant, "지원서 거절 성공");
			})
			.catch(err => next(err));
	} else {
		return SendRule.response(res, HTTPRequestCode.FORBIDDEN, undefined, "권한 없음");
	}
};
