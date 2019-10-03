import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";

/**
 * @description Applicant 요구 데이터
 */
export interface IApplicant {
	club: ObjectID; // 소속 동아리
	title: string; // 대회 이름
	subtitle: string; // 부문
	target: string[]; // 수상자들 ObjectID??
	level: string; // 상격
	createAt: Date;
}
/**
 * @description Applicant 스키마에 대한 메서드 ( 레코드 )
 */
export interface IApplicantSchema extends IApplicant, Document {
}
/**
 * @description Applicant 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IApplicantModel extends Model<IApplicantSchema> {}

const ApplicantSchema: Schema = new Schema({
	club: { type: ObjectID, required: true },
	title: { type: String, default: "" },
	subtitle: { type: String, default: "" },
	target: { type: Array, default: [] },
	level: { type: String, default: "" },
	createAt: { type: Date, default: Date.now }
});

export default model<IApplicantSchema>("Applicant", ApplicantSchema) as IApplicantModel;
