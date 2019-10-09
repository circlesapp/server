import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";
import { IUserSchema } from "../User";
import { IClubSchema } from "../Club";

/**
 * @description Applicant 요구 데이터
 */
export interface IApplicant {
	club: ObjectID; // 소속 동아리
	owner: ObjectID; // 작성자
	name: string;
	email: string;
	number: string;
	phone: string;
	content: string;
}
/**
 * @description Applicant 스키마에 대한 메서드 ( 레코드 )
 */
export interface IApplicantSchema extends IApplicant, Document {
	changeInfomation(data: IApplicant): Promise<IApplicantSchema>;
}
/**
 * @description Applicant 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IApplicantModel extends Model<IApplicantSchema> {
	getApplicantByUser(club: IClubSchema, user: IUserSchema): Promise<IApplicantSchema>;
}

const ApplicantSchema: Schema = new Schema({
	club: { type: ObjectID, required: true },
	owner: { type: ObjectID, required: true, ref: "User" },
	name: { type: String, required: true, default: "" },
	email: { type: String, required: true, default: "" },
	number: { type: String, required: true, default: "" },
	phone: { type: String, required: true, default: "" },
	content: { type: String, required: true, default: "" },
	createAt: { type: Date, default: Date.now }
});
ApplicantSchema.methods.changeInfomation = function(this: IApplicantSchema, data: IApplicant): Promise<IApplicantSchema> {
	Object.keys(data).forEach(x => {
		if (x in this && (x != "club" && x != "owner" && x != "createAt" && x != "_id")) this[x] = data[x] || this[x];
	});
	return this.save();
};
ApplicantSchema.statics.getApplicantByUser = function(this: IApplicantModel, club: IClubSchema, user: IUserSchema): Promise<IApplicantSchema> {
	return new Promise<IApplicantSchema>((resolve, reject) => {
		this.findOne({ owner: user._id, club: club._id })
			.then(applicant => resolve(applicant))
			.catch(err => reject(err));
	});
};

export default model<IApplicantSchema>("Applicant", ApplicantSchema) as IApplicantModel;
