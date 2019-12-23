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
	sendRegister(email: string, code: number): Promise<any> {
		return this.transporter.sendMail({
			from: "admin@hyunwoo.kim",
			to: email,
			subject: "circles. 계정 만들기",
			html: `<!DOCTYPE html>
			<html style="display:-webkit-flex;display:-ms-flexbox;display:flex;justify-content:center;width:100vw;color:#333;">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<meta http-equiv="X-UA-Compatible" content="ie=edge" />
					<title>circles. 계정 만들기</title>
					<link rel="stylesheet" href="https://raw.githubusercontent.com/potyt/fonts/master/macfonts/AvenirBlack/AvenirBlack-Black.ttf" />
					<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@1.0/nanumsquare.css" />
				</head>
				<body>
					<header style="display:-webkit-flex;display:-ms-flexbox;display:flex;justify-content:flex-start;align-items:center;">
						<a href="https://circlesapp.kr" style="margin-right:4px"><img src="https://circlesapp.kr/logo_64.png" alt="cirlces." title="circles." width="40px" height="40px"/></a>
						<span style="font-family:'AvenirBlack','Trebuchet MS',Helvetica,sans-serif;font-size:30px;">
							circles.
						</span>
					</header>
					<div style="margin:10px 0 20px 0;padding:40px;border-radius:10px;font-family:'NanumSquare',sans-serif;text-align:center;background:#fafafa;box-shadow: 0 2px 6px rgba(0,0,0,0.25)">
						<h1 style="font-family:'NanumSquare',sans-serif;font-size:30px;text-align:left;margin-bottom:20px;padding-bottom:7px;border-bottom:1px solid #333;">
							계정 만들기
						</h1>
						<p style="font-family:'NanumSquare',sans-serif;font-weight:400;text-align:left;margin-bottom:40px;">
							circles. 계정 만들기를 계속하려면 아래 버튼을 클릭하십시오.<br />
							본인이 요청하지 않았다면, 이 메일을 무시하십시오.
						</p>
						<a href="https://circlesapp.kr/register?token=${code}&email=${email}" target="_blank" style="padding:6px 20px;color:white;font-size:22px;font-family:'NanumSquare',sans-serif;text-decoration:none;border:none;border-radius:5px;background:#568cff;box-shadow:0 2px 5px rgba(0,0,0,0.4)">계정 만들기</a>
					</div>
					<footer style="text-align:center;font-family:'AvenirBlack','Trebuchet MS',Helvetica,sans-serif;font-size:20px;color:#757575;">
						circles.
					</footer>
				</body>
			</html>`
		});
	}
	sendChangePasswordCode(email: string, code: number): Promise<any> {
		return this.transporter.sendMail({
			from: "admin@hyunwoo.kim",
			to: email,
			subject: "circles. 비밀번호 재설정",
			html: `<!DOCTYPE html>
			<html style="display:-webkit-flex;display:-ms-flexbox;display:flex;justify-content:center;width:100vw;color:#333;">
				<head>
					<meta charset="UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<meta http-equiv="X-UA-Compatible" content="ie=edge" />
					<title>circles. 비밀번호 재설정</title>
					<link rel="stylesheet" href="https://raw.githubusercontent.com/potyt/fonts/master/macfonts/AvenirBlack/AvenirBlack-Black.ttf" />
					<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@1.0/nanumsquare.css" />
				</head>
				<body>
					<header style="display:-webkit-flex;display:-ms-flexbox;display:flex;justify-content:flex-start;align-items:center;">
						<a href="https://circlesapp.kr" style="margin-right:4px"><img src="https://circlesapp.kr/logo_64.png" alt="cirlces." title="circles." width="40px" height="40px"/></a>
						<span style="font-family:'AvenirBlack','Trebuchet MS',Helvetica,sans-serif;font-size:30px;">
							circles.
						</span>
					</header>
					<div style="margin:10px 0 20px 0;padding:40px;border-radius:10px;font-family:'NanumSquare',sans-serif;text-align:center;background:#fafafa;box-shadow: 0 2px 6px rgba(0,0,0,0.25)">
						<h1 style="font-family:'NanumSquare',sans-serif;font-size:30px;text-align:left;margin-bottom:20px;padding-bottom:7px;border-bottom:1px solid #333;">
							비밀번호 재설정
						</h1>
						<p style="font-family:'NanumSquare',sans-serif;font-weight:400;text-align:left;margin-bottom:40px;">
							circles. 비밀번호를 재설정하려면 아래 버튼을 클릭하십시오.<br />
							본인이 요청하지 않았다면, 이 메일을 무시하십시오.
						</p>
						<a href="https://circlesapp.kr/passwordchange?token=${code}&email=${email}" target="_blank" style="padding:6px 20px;color:white;font-size:22px;font-family:'NanumSquare',sans-serif;text-decoration:none;border:none;border-radius:5px;background:#568cff;box-shadow:0 2px 5px rgba(0,0,0,0.4)">비밀번호 재설정</a>
					</div>
					<footer style="text-align:center;font-family:'AvenirBlack','Trebuchet MS',Helvetica,sans-serif;font-size:20px;color:#757575;">
						circles.
					</footer>
				</body>
			</html>`
		});
	}
}

export default new Mailer();
