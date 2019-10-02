import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";
import Budget, { IBudgetSchema, IBudget } from "./Club/Budget";
import Award, { IAwardSchema, IAward } from "./Club/Award";

export enum Permission {
	ACCESS_POST_CREATE, // 글 생성 권한
	ACCESS_POST_READ, // 글 읽기 권한
	ACCESS_POST_DELETE, // 글 삭제 권한

	ACCESS_AWARDS_CREATE, // 수상 생성 권한
	ACCESS_AWARDS_READ, // 수상 읽기 권한
	ACCESS_AWARDS_DELETE, // 수상 삭제 권한

	ACCESS_BUDGETS_CREATE, // 에산서 생성 권한
	ACCESS_BUDGETS_READ, // 예산서 읽기 권한
	ACCESS_BUDGETS_DELETE // 예산서 삭제 권한
}
export interface Member {
	user: ObjectID; // 유저 아이디
	rank: symbol; // 랭크 심볼 key
}
export interface Rank {
	key: symbol; // 랭크 심볼 key
	name: string; // 랭크 이름
	isAdmin?: boolean; // 어드민 권한
	permission: Permission[]; // 권한들
}
/**
 * @description User 요구 데이터
 */
export interface IClub {
	name: string; // 동아리 이름
	members: Member[]; // 동아리 회원
	ranks: Rank[]; // 동아리 계급들
	applicant: ObjectID[]; // 지원자들
	budgets: ObjectID[]; // 예산서들
	awards: ObjectID[]; // 수상자들
}
/**
 * @description User 스키마에 대한 메서드 ( 레코드 )
 */
export interface IClubSchema extends IClub, Document {
	createBudget(data: IBudget): Promise<IClubSchema>;
	createAward(data: IAward): Promise<IClubSchema>;
	removeBudget(budget: IBudgetSchema): Promise<IClubSchema>;
	removeAward(award: IAwardSchema): Promise<IClubSchema>;
}
/**
 * @description User 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IClubModel extends Model<IClubSchema> {
	/**
	 * @description 유저를 생성한 후 그 유저를 반환합니다.
	 * @param {IUser}data 생성할 유저 데이터
	 * @returns {Promise<IUserSchema>} 입력받은 데이터에 대한 유저입니다.
	 */
	createClub(data: IClub): Promise<IClubSchema>;
	/**
	 * @description 이메일을 입력받아 일치하는 유저를 반환합니다.
	 * @param {string}email 찾을 유저의 이메일
	 * @returns {Promise<IUserSchema>} 일치하는 유저를 반환합니다.
	 */
	findByName(name: string): Promise<IClubSchema>;
	/**
	 * @description 이메일을 입력받아 일치하는 유저를 반환합니다.
	 * @param {string}email 찾을 유저의 이메일
	 * @returns {Promise<IUserSchema>} 일치하는 유저를 반환합니다.
	 */
	findByID(_id: ObjectID): Promise<IClubSchema>;
	/**
	 * @description 이메일을 입력받아 계정의 유무를 반환합니다.
	 * @param email 검사 할 유저의 이메일
	 * @returns {boolean} 계정의 유무를 반환합니다.
	 */
	checkPresentClub(name: string): Promise<boolean>;
}

const ClubSchema: Schema = new Schema({
	name: { type: String, required: true, unique: true },
	members: { type: Array, default: [] },
	awards: { type: Array, default: [] },
	budgets: { type: Array, default: [] }
});

ClubSchema.methods.createBudget = function(this: IClubSchema, data: IBudget): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		data.club = this._id;
		let budget = new Budget(data);
		budget
			.save()
			.then(budget => {
				this.budgets.push(budget._id);
				this.save()
					.then(budget => {
						resolve(budget);
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
ClubSchema.methods.createAward = function(this: IClubSchema, data: IAward): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		data.club = this._id;
		let award = new Award(data);
		award
			.save()
			.then(award => {
				this.awards.push(award._id);
				this.save()
					.then(award => {
						resolve(award);
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};

ClubSchema.methods.removeBudget = function(this: IClubSchema, budget: IBudgetSchema): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		let idx = this.budgets.findIndex(x => {
			budget._id.equals(x);
		});
		if (idx != -1) {
			this.budgets.splice(idx, 1);
		}
		this.save()
			.then(club => {
				budget
					.remove(() => {
						resolve(club);
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
ClubSchema.methods.removeAward = function(this: IClubSchema, award: IAwardSchema): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		let idx = this.budgets.findIndex(x => {
			award._id.equals(x);
		});
		if (idx != -1) {
			this.awards.splice(idx, 1);
		}
		this.save()
			.then(club => {
				award
					.remove(() => {
						resolve(club);
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};

ClubSchema.statics.createClub = function(this: IClubModel, data: IClub): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {});
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
	return new Promise<boolean>((resolve, reject) => {});
};
export default model<IClubSchema>("Club", ClubSchema) as IClubModel;
