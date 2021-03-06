import { Request, Response, NextFunction } from "express";
import User, { IUser, IUserSchema } from "../../schemas/User";
import SendRule, { HTTPRequestCode, StatusError } from "../../modules/Send-Rule";
import * as fs from "fs";
import Base64ToImage from "../../modules/Base64-To-Image";
import CertificationManager from "../../modules/Certification-Manager";
import Mailer from "../../modules/Mailer";

/**
 * @description 회원가입 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const Register = (req: Request, res: Response, next: NextFunction) => {
	let data: IUser = req.body as IUser;
	let code: string = req.body.code;
	if (User.dataCheck(data)) {
		User.checkPresentAccount(data.email)
			.then(check => {
				if (!check) {
					if (CertificationManager.checkCertification(data.email, parseInt(code))) {
						User.createUser(data)
							.then(data => {
								SendRule.response(res, HTTPRequestCode.CREATE, data.getUserToken(), "회원가입 성공");
							})
							.catch(err => next(err));
					} else {
						next(new StatusError(HTTPRequestCode.UNAUTHORIZED, "인증 실패"));
					}
				} else {
					next(new StatusError(HTTPRequestCode.BAD_REQUEST, "이미 존재하는 계정입니다."));
				}
			})
			.catch(err => next(err));
	} else {
		next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
};

/**
 * @description 로그인 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const Login = (req: Request, res: Response, next: NextFunction) => {
	let data: IUser = req.body as IUser;
	if (User.dataCheck(data)) {
		User.loginValidation(data, true)
			.then(data => {
				SendRule.response(res, HTTPRequestCode.OK, data.getUserToken(), "로그인 성공");
			})
			.catch(err => {
				next(err);
			});
	} else {
		next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
};

/**
 * @description 토큰을 이용한 프로필 가져오기 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const GetProfile = (req: Request, res: Response, next: NextFunction) => {
	(req.user as IUserSchema)
		.populate({ path: "applicants", select: "createAt club", populate: { path: "club", select: "imgPath name" } })
		.execPopulate()
		.then(user => {
			if (req.body) {
				console.log(req.body);
				user.updatePushSubscription(req.body)
					.then(user => {
						SendRule.response(res, 200, user, "푸시 갱신 성공");
					})
					.catch(err => next(err));
			} else SendRule.response(res, 200, user);
		})
		.catch(err => next(err));
};
/**
 * @description 비밀번호 변경을 위해 메일을 보내는 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const RequestRegisterdByEmail = (req: Request, res: Response, next: NextFunction) => {
	let email = req.body.email;

	if (email) {
		let code = CertificationManager.registerCertification(email);
		Mailer.sendRegister(email, code)
			.then(() => {
				SendRule.response(res, 200, undefined, "이메일 보내기 성공");
			})
			.catch(err => next(err));
	} else {
		next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
};
export const RequestChangePassworddByEmail = (req: Request, res: Response, next: NextFunction) => {
	let email = req.body.email;

	if (email) {
		let code = CertificationManager.registerCertification(email);
		Mailer.sendChangePasswordCode(email, code)
			.then(() => {
				SendRule.response(res, 200, undefined, "이메일 보내기 성공");
			})
			.catch(err => next(err));
	} else {
		next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
};
/**
 * @description 비밀번호 변경 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const ChangePassword = (req: Request, res: Response, next: NextFunction) => {
	let email = req.body.email;
	let newPassword = req.body.newPassword;
	let code: number = req.body.code;

	if (email && newPassword && code) {
		User.findByEmail(email)
			.then(user => {
				if (CertificationManager.checkCertification(email, code)) {
					user.changePassword(newPassword)
						.then(user => {
							SendRule.response(res, 200, user.getUserToken(), "비밀번호 변경 성공");
						})
						.catch(err => next(err));
				} else {
					next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
				}
			})
			.catch(err => next(err));
	} else {
		next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
};
/**
 * @description 비밀번호 외의 다른 정보를 변경하는 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const ChangeInfomation = (req: Request, res: Response, next: NextFunction) => {
	let data: any = req.body;
	let user: IUserSchema = req.user as IUserSchema;
	user.changeInfomation(data)
		.then(user => {
			SendRule.response(res, 200, user, "정보 변경 성공");
		})
		.catch(err => next(err));
};

/**
 * @description 회원 탈퇴 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const WithdrawAccount = (req: Request, res: Response, next: NextFunction) => {
	let user: IUserSchema = req.user as IUserSchema;

	user.withdrawAccount()
		.then(() => {
			SendRule.response(res, HTTPRequestCode.OK, undefined, "계정 삭제 성공");
		})
		.catch(err => next(err));
};

/**
 * @description 프로필 사진 수정 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const ChangeProfileImage = (req: Request, res: Response, next: NextFunction) => {
	let user: IUserSchema = req.user as IUserSchema;
	let imageData = req.body.img as string; // img
	if (imageData) {
		let data = Base64ToImage.getImageData(imageData);
		if (user.imgPath != "") {
			try {
				fs.unlinkSync(`public/${user.imgPath}`);
			} catch (err) {
				next(err);
			}
		}
		user.imgPath = `user/${user._id}.${data.imgType}`;
		fs.writeFile(`public/${user.imgPath}`, data.imgFile, err => {
			if (err) next(err);
			user.save()
				.then(user => {
					SendRule.response(res, HTTPRequestCode.CREATE, user, "프로필 사진 수정 성공");
				})
				.catch(err => next(err));
		});
	} else {
		next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
};

export const GetAlarm = (req: Request, res: Response, next: NextFunction) => {
	let user: IUserSchema = req.user as IUserSchema;

	SendRule.response(res, HTTPRequestCode.OK, user.getAlarm(), "알람 가져오기 성공");
};

export const RemoveAlarm = (req: Request, res: Response, next: NextFunction) => {
	let user: IUserSchema = req.user as IUserSchema;
	let data = req.body.id;

	user.removeAlarm(data)
		.then(user => {
			SendRule.response(res, HTTPRequestCode.OK, user.getAlarm(), "알람 삭제 성공");
		})
		.catch(err => next(err));
};

export const RemoveAllAlarm = (req: Request, res: Response, next: NextFunction) => {
	let user: IUserSchema = req.user as IUserSchema;

	user.removeAllAlarm()
		.then(user => {
			SendRule.response(res, HTTPRequestCode.OK, user.getAlarm(), "알람 삭제 성공");
		})
		.catch(err => next(err));
};
