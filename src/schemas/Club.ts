import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";

/**
 * @description User 요구 데이터
 */
export interface IClub {
	name: string;
	members: ObjectID[];
	budgets: ObjectID[];
	awards: ObjectID[];
}
/**
 * @description User 스키마에 대한 메서드 ( 레코드 )
 */
export interface IClubSchema extends IClub, Document {}
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

ClubSchema.statics.createClub = function(this: IClubModel, data: IClub): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {});
};
ClubSchema.statics.findByName = function(this: IClubModel, name: string): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {});
};
ClubSchema.statics.checkPresentClub = async function(this: IClubModel, name: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {});
};
export default model<IClubSchema>("Club", ClubSchema) as IClubModel;
