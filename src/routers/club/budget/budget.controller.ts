import { Request, Response, NextFunction } from "express";
import { IUserSchema } from "../../../schemas/User";
import SendRule, { StatusError, HTTPRequestCode } from "../../../modules/Send-Rule";
import { IClubSchema, Permission } from "../../../schemas/Club";
import Budget, { IBudgetSchema, IBudget } from "../../../schemas/Club/Budget";

export const Write = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body as IBudget;
	if (!user.isJoinClub(club)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "소속된 동아리가 아님"));
	} else if (!club.checkPermission(Permission.ACCESS_BUDGETS_CREATE, user)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "동아리 내부 권한 없음"));
	}
	let budget = new Budget(data);
	budget.club = club._id;
	budget
		.save()
		.then(budget => {
			SendRule.response(res, HTTPRequestCode.CREATE, budget, "예산 작성 성공");
		})
		.catch(err => next(err));
};

export const GetPublicBudgets = function(req: Request, res: Response, next: NextFunction) {
	let club = (req as any).club as IClubSchema;

	club.getClubBudgets()
		.then((budgets: IBudgetSchema[]) => {
			SendRule.response(res, HTTPRequestCode.OK, budgets);
		})
		.catch(err => next(err));
};
