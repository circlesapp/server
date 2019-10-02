import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";
import Club, { IClubSchema } from "../Club";

/**
 * @description User 요구 데이터
 */
export interface IAward {
	club: ObjectID; // 소속 동아리
	title: string; // 대회 이름
	subtitle: string; // 부문
	target: string[]; // 수상자들 ObjectID??
	level: string; // 상격
}
/**
 * @description User 스키마에 대한 메서드 ( 레코드 )
 */
export interface IAwardSchema extends IAward, Document {
	removeThis(): Promise<IClubSchema>;
}
/**
 * @description User 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IAwardModel extends Model<IAwardSchema> {}

const AwardSchema: Schema = new Schema({
	club: { type: ObjectID, required: true },
	title: { type: String, default: "" },
	subtitle: { type: String, default: "" },
	target: { type: Array, default: [] },
	level: { type: String, default: "" }
});

AwardSchema.methods.removeThis = function(this: IAwardSchema): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		Club.findByID(this.club)
			.then(club => {
				club.removeAward(this)
					.then(club => {
						resolve(club);
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};

export default model<IAwardSchema>("Award", AwardSchema) as IAwardModel;
