import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";

/**
 * @description Budget 요구 데이터
 */
export interface IBudget {
	club: ObjectID; // 소속 동아리
	item: string; // 물건 이름
	size: string; // 규격
	price: number; // 가격
	url: string; // URL
	quantity: number; // 개수
	shipping: number; // 배송비
	date: Date;
}
/**
 * @description Budget 스키마에 대한 메서드 ( 레코드 )
 */
export interface IBudgetSchema extends IBudget, Document {}
/**
 * @description Budget 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IBudgetModel extends Model<IBudgetSchema> {}

const IBudgetSchema: Schema = new Schema({
	club: { type: ObjectID, required: true },
	item: { type: String, default: "" },
	size: { type: String, default: "" },
	price: { type: Number, default: "" },
	url: { type: String, default: "" },
	quantity: { type: Number, default: "" },
	shipping: { type: Number, default: "" },
	createAt: { type: Date, default: Date.now }
});

export default model<IBudgetSchema>("Budget", IBudgetSchema) as IBudgetModel;
