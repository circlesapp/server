import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";

/**
 * @description Award 요구 데이터
 */
export interface IAward {
	club: ObjectID; // 소속 동아리
	title: string; // 대회 이름
	subtitle: string; // 부문
	target: ObjectID[]; // 수상자들 ObjectID??
	level: string; // 상격
	date: Date;
}
/**
 * @description Award 스키마에 대한 메서드 ( 레코드 )
 */
export interface IAwardSchema extends IAward, Document {}
/**
 * @description Award 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IAwardModel extends Model<IAwardSchema> {}

const AwardSchema: Schema = new Schema({
	club: { type: ObjectID, required: true },
	title: { type: String, default: "" },
	subtitle: { type: String, default: "" },
	target: [{ type: ObjectID, ref: "User" }],
	level: { type: String, default: "" },
	date: { type: Date, default: Date.now }
});

export default model<IAwardSchema>("Award", AwardSchema) as IAwardModel;
