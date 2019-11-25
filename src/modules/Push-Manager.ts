import * as WebPush from "web-push";

WebPush.setGCMAPIKey("AIzaSyCpP6DkP_LO9UIMGs2M6yQX0q9-Hh8HVDk");
WebPush.setVapidDetails("mailto:example@yourdomain.org", "BOv3hzFFm8Vac3tXPsNT9CmOEBvJA3kUfJ3C0QMI33VaeN8Gl8hs9GBcg1xtECK53YeF7dm9Dzc8YQfdmno8z28", "0DPpRHxMgLTWBLaPx89EWzdwm9LgMnINQrlc7rUZHyI");

export default {
	sendMessage(pushSubscription: WebPush.PushSubscription, message: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			WebPush.sendNotification(pushSubscription, message)
				.then(data => {
					console.log(data);
					resolve(true);
				})
				.catch(err => {
					console.log("fail");
					resolve(false);
				});
		});
	}
};
