import { Document, Schema, Model, model } from "mongoose";
import * as crypto from "crypto";
import * as jwt from "jwt-simple";
import { StatusError, HTTPRequestCode } from "../modules/Send-Rule";
import { ObjectID } from "bson";
import * as moment from "moment";
import "moment-timezone";
import { IClubSchema } from "./Club";
import { IApplicantSchema } from "./Club/Applicant";
import * as WebPush from "web-push";
import PushManager from "../modules/Push-Manager";

moment.tz.setDefault("Asia/Seoul");
moment.locale("ko");

export interface Alarm {
	id?: number;
	message: string; // 알람 메세지
	createAt?: Date; // 생성일
	timeString?: String; // 시간 비교
}
export interface PasswordAndSalt {
	password: string;
	salt: string;
}
/**
 * @description User 요구 데이터
 */
export interface IUser {
	clubs: ObjectID[]; // 소속 동아리
	email: string; // 이메일
	password: string; // 비밀번호
	name: string;
	message: string;
	applicants: ObjectID[];
	alarms: Alarm[]; // 알람 스택
	imgPath: string; // 프로필 사진
	pushSubscription: WebPush.PushSubscription;
	lastLogin?: Date; // 마지막 로그인 시간
	createAt?: Date; // 생성일
	salt?: string; // 암호화 키
	isWithdraw: boolean;
}
/**
 * @description User 스키마에 대한 메서드 ( 레코드 )
 */
export interface IUserSchema extends IUser, Document {
	/**
	 * @description 이 유저에 대한 토큰을 생성합니다.
	 * @returns {string} 이 유저에 대한 토큰을 반홚바니다.
	 */
	getUserToken(): string;
	/**
	 * @description 이 유저의 비밀번호를 변경합니다.
	 * @param {IUserSchema}data newPassword 필드에 바꿀 비밀번호를 입력
	 * @returns {Promise<IUserSchema>} 작업이 완료 된 후 그 유저를 반환합니다.
	 */
	changePassword(newPassword: string): Promise<IUserSchema>;
	/**
	 * @description 이 유저의 정보를 반환합니다.
	 * @param {IUser}data 유저의 바꿀 정보
	 * @returns {Promise<IUserSchema>} 작업이 완료된 후 그 유저를 반환합니다.
	 */
	changeInfomation(data: IUser): Promise<IUserSchema>;
	/**
	 * @description 이 유저의 계정을 삭제합니다.
	 * @returns {Promise<boolean>} 성공 여부를 반환합니다.
	 */
	withdrawAccount(): Promise<boolean>;
	/**
	 * @description 로그인 시간을 갱신합니다.
	 * @returns {Promise<IUserSchema>} 작업이 완료 된 후 그 유저를 반환합니다.
	 */
	updateLoginTime(): Promise<IUserSchema>;
	updatePushSubscription(pushSubscription: WebPush.PushSubscription): Promise<IUserSchema>;
	getAlarm(): Alarm[];
	pushApplicant(applicant: IApplicantSchema): Promise<IUserSchema>;
	removeApplicant(applicant: IApplicantSchema): Promise<IUserSchema>;
	pushAlarm(alarm: Alarm): IUserSchema;
	pushAlarmAndSave(alarm: Alarm): Promise<IUserSchema>;
	removeAlarm(id: number): Promise<IUserSchema>;
	removeAllAlarm(): Promise<IUserSchema>;
	isJoinClub(club: IClubSchema): boolean;
	joinClub(club: IClubSchema): Promise<IUserSchema>;
	leaveClub(club: IClubSchema): Promise<IUserSchema>;
}
/**
 * @description User 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IUserModel extends Model<IUserSchema> {
	/**
	 * @description email과 password 필드의 유효성을 검사합니다.
	 * @param {any}data 체크 할 객체
	 * @returns {boolean} 유효성 결과
	 */
	dataCheck(data: any): boolean;
	/**
	 * @description 유저가 로그인이 가능한지 확인합니다.
	 * @param data 유효성 검사 유저
	 * @param {boolean}first 최초 로그인 시 (비밀번호가 암호화 되지 않았을 시)
	 * @returns {Promise<IUserSchema>} 성공 시 그 유저를 반환합니다.
	 */
	loginValidation(data: IUser, first?: boolean): Promise<IUserSchema>;
	/**
	 * @description 입력받은 유저의 토큰을 생성합니다.
	 * @returns {string} 입력받은 유저에 대한 토큰
	 */
	getToken(data: IUserSchema): string;
	/**
	 * @description 암호화 할 비밀번호를 입력받아 비밀번호와 암호화 키를 반환합니다.
	 * @param {string}password 암호화 할 비밀번호
	 * @returns {Promise<PasswordAndSalt>} 비밀번호와 암호화 키를 반환합니다.
	 */
	createPassword(password: string): Promise<PasswordAndSalt>;
	/**
	 * @description 유저를 생성한 후 그 유저를 반환합니다.
	 * @param {IUser}data 생성할 유저 데이터
	 * @returns {Promise<IUserSchema>} 입력받은 데이터에 대한 유저입니다.
	 */
	createUser(data: IUser): Promise<IUserSchema>;
	/**
	 * @description 이메일을 입력받아 일치하는 유저를 반환합니다.
	 * @param {string}email 찾을 유저의 이메일
	 * @returns {Promise<IUserSchema>} 일치하는 유저를 반환합니다.
	 */
	findByEmail(email: string): Promise<IUserSchema>;
	/**
	 * @description 이메일을 입력받아 계정의 유무를 반환합니다.
	 * @param email 검사 할 유저의 이메일
	 * @returns {boolean} 계정의 유무를 반환합니다.
	 */
	checkPresentAccount(email: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
	clubs: [{ type: ObjectID, ref: "Club" }],
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	name: { type: String, required: true },
	message: { type: String, default: "" },
	applicants: [{ type: ObjectID, ref: "Applicant" }],
	alarms: { type: Array, default: [] },
	imgPath: { type: String, default: "" },
	pushSubscription: { type: Object, default: {} },
	lastLogin: { type: Date, default: Date.now },
	createAt: { type: Date, default: Date.now },
	salt: { type: String, default: process.env.SECRET_KEY || "SECRET" },
	isWithdraw: { type: Boolean, default: false }
});
UserSchema.methods.getUserToken = function(this: IUserSchema): string {
	return (this.constructor as IUserModel).getToken(this);
};
UserSchema.methods.changePassword = function(this: IUserSchema, newPassword: string): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		(this.constructor as IUserModel)
			.createPassword(newPassword)
			.then((passsalt: PasswordAndSalt) => {
				this.password = passsalt.password;
				this.salt = passsalt.salt;
				this.save()
					.then((data: IUserSchema) => {
						resolve(data);
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
UserSchema.methods.changeInfomation = function(this: IUserSchema, data: IUser): Promise<IUserSchema> {
	Object.keys(data).forEach(x => {
		if (x in this && x != "email" && x != "_id" && x != "password" && x != "salt") this[x] = data[x] || this[x];
	});
	return this.save();
};
UserSchema.methods.withdrawAccount = function(this: IUserSchema): Promise<any> {
	this.isWithdraw = true;
	return this.save();
};
UserSchema.methods.updateLoginTime = function(this: IUserSchema): Promise<IUserSchema> {
	this.lastLogin = new Date();
	return this.save();
};
UserSchema.methods.updatePushSubscription = function(this: IUserSchema, pushSubscription: WebPush.PushSubscription): Promise<IUserSchema> {
	this.pushSubscription = pushSubscription;
	return this.save();
};

UserSchema.methods.pushApplicant = function(this: IUserSchema, applicant: IApplicantSchema): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		this.applicants.push(applicant._id);
		this.save()
			.then(user => {
				resolve(user);
			})
			.catch(err => reject(err));
	});
};
UserSchema.methods.removeApplicant = function(this: IUserSchema, applicant: IApplicantSchema): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		this.applicants.splice(this.applicants.indexOf(applicant._id), 1);
		applicant
			.remove()
			.then(() => {
				this.save()
					.then(user => {
						resolve(user);
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};

UserSchema.methods.getAlarm = function(this: IUserSchema): Alarm[] {
	return this.alarms.map(x => {
		x.timeString = moment(x.createAt)
			.startOf()
			.fromNow();
		return x;
	});
};
UserSchema.methods.pushAlarm = function(this: IUserSchema, alarm: Alarm): IUserSchema {
	PushManager.sendMessage(this.pushSubscription, alarm.message);
	let top = this.alarms[0];
	alarm.id = top ? top.id + 1 : 0;
	alarm.createAt = new Date();
	this.alarms.unshift(alarm);
	return this;
};
UserSchema.methods.pushAlarmAndSave = function(this: IUserSchema, alarm: Alarm): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		this.pushAlarm(alarm)
			.save()
			.then(user => {
				resolve(user);
			})
			.catch(err => reject(err));
	});
};
UserSchema.methods.removeAlarm = function(this: IUserSchema, id: number): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		let idx = this.alarms.findIndex((alarm: Alarm) => alarm.id == id);
		if (idx != -1) this.alarms.splice(idx, 1);
		this.save()
			.then(user => {
				resolve(user);
			})
			.catch(err => reject(err));
	});
};
UserSchema.methods.removeAllAlarm = function(this: IUserSchema): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		this.alarms = [];
		this.save()
			.then(user => {
				resolve(user);
			})
			.catch(err => reject(err));
	});
};

UserSchema.methods.joinClub = function(this: IUserSchema, club: IClubSchema): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		if (!this.isJoinClub(club)) {
			this.clubs.push(club._id);
			this.pushAlarm({
				message: `<b>${club.name}</b> 동아리에 가입했습니다.`
			})
				.save()
				.then(user => {
					club.members.push({ rank: 1, user: this._id });
					club.save()
						.then(club => {
							resolve(user);
						})
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		} else {
			reject(new StatusError(400, "이미 가입된 동아리 입니다."));
		}
	});
};
UserSchema.methods.leaveClub = function(this: IUserSchema, club: IClubSchema): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		if (this.isJoinClub(club)) {
			let idx = this.clubs.findIndex((clubid: ObjectID) => club._id.equals(clubid));
			this.clubs.splice(idx, 1);
			this.pushAlarm({
				message: `<b>${club.name}</b> 동아리를 탈퇴했습니다.`
			})
				.save()
				.then(user => {
					let idx = club.members.findIndex(user => this._id.equals(user.user));
					club.members.splice(idx, 1);
					club.save()
						.then(club => {
							resolve(user);
						})
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		} else {
			reject(new StatusError(400, "가입되지 않은 동아리 입니다."));
		}
	});
};
UserSchema.methods.isJoinClub = function(this: IUserSchema, club: IClubSchema): boolean {
	return this.clubs.findIndex((c: any) => c._id.equals(club._id)) != -1;
};

UserSchema.statics.dataCheck = function(this: IUserModel, data: any): boolean {
	return "email" in data && "password" in data;
};
UserSchema.statics.loginValidation = function(this: IUserModel, data: IUser, first: boolean = false): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		this.findByEmail(data.email)
			.then((user: IUserSchema) => {
				if (!user.isWithdraw) {
					user.updateLoginTime()
						.then(user => {
							if (first) {
								crypto.pbkdf2(data.password, user.salt, 10000, 64, "sha512", (err, key) => {
									if (err) reject(err);
									if (key.toString("base64") == user.password) {
										resolve(user);
									} else {
										reject(new StatusError(HTTPRequestCode.FORBIDDEN, "비밀번호가 일치하지 않습니다."));
									}
								});
							} else {
								if (data.password == user.password) {
									resolve(user);
								} else {
									reject(new StatusError(HTTPRequestCode.FORBIDDEN, "비밀번호가 일치하지 않습니다."));
								}
							}
						})
						.catch(err => reject(err));
				} else {
					reject(new StatusError(HTTPRequestCode.FORBIDDEN, "삭제된 계정입니다."));
				}
			})
			.catch(err => reject(err));
	});
};
UserSchema.statics.getToken = function(this: IUserModel, data: IUser): string {
	let user = {
		email: data.email,
		password: data.password
	};
	return "Bearer " + jwt.encode(user, process.env.SECRET_KEY || "SECRET");
};
UserSchema.statics.createPassword = function(this: IUserModel, password: string): Promise<PasswordAndSalt> {
	let data: PasswordAndSalt = {
		password: "",
		salt: ""
	};
	return new Promise<PasswordAndSalt>((resolve, reject) => {
		crypto.randomBytes(64, (err: Error, buf: Buffer) => {
			if (err) reject(err);
			let salt = buf.toString("base64");
			data.salt = salt;
			crypto.pbkdf2(password, salt, 10000, 64, "sha512", (err: Error, key: Buffer) => {
				if (err) reject(err);
				data.password = key.toString("base64");
				resolve(data);
			});
		});
	});
};
UserSchema.statics.createUser = function(this: IUserModel, data: IUser): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		this.createPassword(data.password)
			.then((passsalt: PasswordAndSalt) => {
				data.password = passsalt.password;
				data.salt = passsalt.salt;
				let user = new this(data);
				user.save()
					.then((data: IUserSchema) => {
						resolve(data);
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
UserSchema.statics.findByEmail = function(this: IUserModel, email: string): Promise<IUserSchema> {
	return new Promise<IUserSchema>((resolve, reject) => {
		this.findOne({ email })
			.populate("clubs", "name imgPath")
			.then((data: IUserSchema) => {
				if (data) {
					resolve(data);
				} else {
					reject(new Error("계정이 존재하지 않습니다."));
				}
			})
			.catch(err => reject(err));
	});
};
UserSchema.statics.checkPresentAccount = async function(this: IUserModel, email: string): Promise<boolean> {
	let data = await this.findOne({ email });
	if (data) return true;
	else return false;
};
export default model<IUserSchema>("User", UserSchema) as IUserModel;
