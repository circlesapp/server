import * as Nodemailer from "nodemailer";
import * as GoogleAuth from "google-auth-library";
import secret from "../../keys/mail";
import Logger from "./Logger";

class Mailer {
	transporter: Nodemailer.Transporter;
	constructor() {
		const oauth2Client = new GoogleAuth.OAuth2Client(secret.client_id, secret.client_secret, "https://developers.google.com/oauthplayground");
		oauth2Client.setCredentials({
			refresh_token: secret.refresh_token
		});

		this.transporter = Nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				type: "OAuth2",
				user: "admin@hyunwoo.kim",
				clientId: secret.client_id,
				clientSecret: secret.client_secret,
				refreshToken: secret.refresh_token,
				accessToken: oauth2Client.getAccessToken()
			}
		} as Nodemailer.TransportOptions);
	}
	sendChangePasswordCode(email: string, code: number): Promise<any> {
		return this.transporter.sendMail({
			from: "admin@hyunwoo.kim",
			to: email,
			subject: "circles. 인증번호",
			html: `<h1>circles</h1><p>인증번호: ${code}</p>`
		});
	}
}

export default new Mailer();
