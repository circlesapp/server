import * as Nodemailer from "nodemailer";
import * as SmtpTransport from "nodemailer-smtp-transport";
import Logger from "./Logger";

class Mailer {
	transporter: Nodemailer.Transporter;
	constructor() {
		this.transporter = Nodemailer.createTransport(
			SmtpTransport({
				service: "gmail",
				host: "smtp.gmail.com",
				auth: {
					user: process.env.GOOGLE_EMAIL,
					pass: process.env.GOOGLE_PASSWORD
				}
			})
		);
	}
	sendChangePasswordCode(email: string, code: number): Promise<any> {
		return this.transporter.sendMail({
			from: "appdatq@gmail.com",
			to: email,
			subject: "circles. 인증번호",
			html: `<h1>circles</h1><p>인증번호: ${code}</p>`
		});
	}
}

export default new Mailer();
