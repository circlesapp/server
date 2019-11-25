import { Request, Response, NextFunction } from "express";
import PushManager from "../../modules/Push-Manager";

export const Page = (req: Request, res: Response, next: NextFunction) => {
	res.sendFile("public/admin/index.html");
};
export const TestPushAlarm = (req: Request, res: Response, next: NextFunction) => {
	PushManager.sendMessage(req.body, "PushTest")
		.then(check => {
			console.log(check);
			res.send(check);
		})
		.catch(err => {
			console.log(err);
			next(err);
		});
};
