import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";
import Budget, { IBudgetSchema, IBudget } from "./Club/Budget";
import Award, { IAwardSchema, IAward } from "./Club/Award";
import Applicant, { IApplicantSchema, IApplicant } from "./Club/Applicant";
import { StatusError } from "../modules/Send-Rule";
import { IUserSchema } from "./User";

export enum Permission {
	ACCESS_POST_CREATE, // 글 생성 권한
	ACCESS_POST_READ, // 글 읽기 권한
	ACCESS_POST_DELETE, // 글 삭제 권한

	ACCESS_AWARDS_CREATE, // 수상 생성 권한
	ACCESS_AWARDS_READ, // 수상 읽기 권한
	ACCESS_AWARDS_DELETE, // 수상 삭제 권한

	ACCESS_BUDGETS_CREATE, // 에산서 생성 권한
	ACCESS_BUDGETS_READ, // 예산서 읽기 권한
	ACCESS_BUDGETS_DELETE, // 예산서 삭제 권한

	ACCESS_APPLYCANT_READ, // 지원서 읽기 권한
    ACCESS_APPLYCANT_DELETE, // 지원서 삭제 권한
}
export interface Member {
	user: ObjectID; // 유저 아이디
	rank: string; // 랭크 이름
}
export interface Rank {
	name: string; // 랭크 이름
	isAdmin?: boolean; // 어드민 권한
	permission: Permission[]; // 권한들
}
/**
 * @description User 요구 데이터
 */
export interface IClub {
	name: string; // 동아리 이름
	owner: ObjectID;
	members?: Member[]; // 동아리 회원
	ranks?: Rank[]; // 동아리 계급들
	createAt?: Date;
}
/**
 * @description User 스키마에 대한 메서드 ( 레코드 )
 */
export interface IClubSchema extends IClub, Document {
	createBudget(data: IBudget): Promise<IBudgetSchema>;
	createAward(data: IAward): Promise<IAwardSchema>;
	createApplicant(data: IApplicant): Promise<IApplicantSchema>;
	removeBudget(budget: IBudgetSchema): Promise<IClubSchema>;
	removeAward(award: IAwardSchema): Promise<IClubSchema>;
	removeApplicant(award: IApplicantSchema): Promise<IClubSchema>;
}
/**
 * @description User 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IClubModel extends Model<IClubSchema> {
	/**
	 * @description 동아리를 생성한 후 그 동아리를 반환합니다.
	 * @param {IUser}data 생성할 동아리 데이터
	 * @returns {Promise<IUserSchema>} 입력받은 데이터에 대한 동아리입니다.
	 */
	createClub(data: IClub): Promise<IClubSchema>;
	/**
	 * @description 동아리 이름을 입력받아 일치하는 동아리를 반환합니다.
	 * @param {string}email 찾을 동아리 이름
	 * @returns {Promise<IUserSchema>} 일치하는 동아리를 반환합니다.
	 */
	findByName(name: string): Promise<IClubSchema>;
	/**
	 * @description 아이디을 입력받아 일치하는 동아리를 반환합니다.
	 * @param {string}email 찾을 동아리의 아이디
	 * @returns {Promise<IUserSchema>} 일치하는 동아리를 반환합니다.
	 */
	findByID(_id: ObjectID): Promise<IClubSchema>;
	/**
	 * @description 동아리 이름을 입력받아 동아리 유무를 반환합니다.
	 * @param email 검사 할 동아리 이름
	 * @returns {boolean} 동아리의 유무를 반환합니다.
	 */
	checkPresentClub(name: string): Promise<boolean>;
}
const defaultRank: Rank[] = [
	{
		name: "admin",
		isAdmin: true,
		permission: []
	},
	{
		name: "default",
		isAdmin: false,
		permission: [Permission.ACCESS_AWARDS_READ, Permission.ACCESS_BUDGETS_READ, Permission.ACCESS_POST_CREATE, Permission.ACCESS_POST_READ, Permission.ACCESS_POST_DELETE]
	}
];
const ClubSchema: Schema = new Schema({
	name: { type: String, required: true, unique: true },
	owner: { type: ObjectID, required: true },
	members: { type: Array, default: [] },
	ranks: { type: Array, default: defaultRank },
	createAt: { type: Date, default: Date.now }
});

ClubSchema.methods.createBudget = function(this: IClubSchema, data: IBudget): Promise<IBudgetSchema> {
	return new Promise<IBudgetSchema>((resolve, reject) => {
		data.club = this._id;
		let budget = new Budget(data);
		budget
			.save()
			.then(budget => resolve(budget))
			.catch(err => reject(err));
	});
};
ClubSchema.methods.createAward = function(this: IClubSchema, data: IAward): Promise<IAwardSchema> {
	return new Promise<IAwardSchema>((resolve, reject) => {
		data.club = this._id;
		let award = new Award(data);
		award
			.save()
			.then(award => resolve(award))
			.catch(err => reject(err));
	});
};
ClubSchema.methods.createApplicant = function(this: IClubSchema, data: IApplicant): Promise<IApplicantSchema> {
	return new Promise<IApplicantSchema>((resolve, reject) => {
		data.club = this._id;
		let applicant = new Applicant(data);
		applicant
			.save()
			.then(applicant => resolve(applicant))
			.catch(err => reject(err));
	});
};

ClubSchema.statics.createClub = function(this: IClubModel, owner: IUserSchema, data: IClub): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		this.checkPresentClub(data.name).then(check => {
			if (!check) {
				let club = new this();
				club.owner = owner._id;
				club.save()
					.then(club => resolve(club))
					.catch(err => reject(err));
			} else {
				reject(new StatusError(400, "이미 있는 동아리 입니다."));
			}
		});
	});
};
ClubSchema.statics.findByName = function(this: IClubModel, name: string): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		this.findOne({ name: { $regex: name, $options: "i" } })
			.then(club => resolve(club))
			.catch(err => reject(err));
	});
};
ClubSchema.statics.findByID = function(this: IClubModel, _id: ObjectID): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		this.findOne({ _id })
			.then(club => resolve(club))
			.catch(err => reject(err));
	});
};
ClubSchema.statics.checkPresentClub = async function(this: IClubModel, name: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		this.findOne({ name: { $regex: name, $options: "i" } })
			.then(club => {
				if (club) resolve(true);
				else resolve(false);
			})
			.catch(err => reject(err));
	});
};
export default model<IClubSchema>("Club", ClubSchema) as IClubModel;
