import { Request, Response, NextFunction } from "express";
import * as WebPush from "web-push";

function urlBase64ToUint8Array(base64String) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export const Page = (req: Request, res: Response, next: NextFunction) => {
	res.sendFile("public/admin/index.html");
};
export const TestPushAlarm = (req: Request, res: Response, next: NextFunction) => {
	WebPush.setGCMAPIKey("AIzaSyCpP6DkP_LO9UIMGs2M6yQX0q9-Hh8HVDk");
	WebPush.setVapidDetails("mailto:example@yourdomain.org", "BOv3hzFFm8Vac3tXPsNT9CmOEBvJA3kUfJ3C0QMI33VaeN8Gl8hs9GBcg1xtECK53YeF7dm9Dzc8YQfdmno8z28", "0DPpRHxMgLTWBLaPx89EWzdwm9LgMnINQrlc7rUZHyI");

	const pushSubscription = req.body;

	WebPush.sendNotification(pushSubscription, "PushTest")
		.then(data => {
			res.send(data);
		})
		.catch(err => next(err));
};
