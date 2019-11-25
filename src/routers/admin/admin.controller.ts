import { Request, Response, NextFunction } from "express";
import PushManager from "../../modules/Push-Manager";

export const Page = (req: Request, res: Response, next: NextFunction) => {
	res.sendFile("public/admin/index.html");
};
export const TestPushAlarm = (req: Request, res: Response, next: NextFunction) => {
	PushManager.sendMessage(req.body, "PushTest")
		.then(check => {
			res.send(check);
		})
		.catch(err => {
			next(err);
		});
};
