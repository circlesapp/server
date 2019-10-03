import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";

/**
 * @description Todo 요구 데이터
 */
export interface ITodo {
	club: ObjectID;
	isClear: boolean;
	content: string;
	deadline: Date;
}
/**
 * @description Todo 스키마에 대한 메서드 ( 레코드 )
 */
export interface ITodoSchema extends ITodo, Document {}
/**
 * @description Todo 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface ITodoModel extends Model<ITodoSchema> {}

const TodoSchema: Schema = new Schema({
	club: { type: ObjectID, required: true },
	isClear: { type: Boolean, default: false },
	content: { type: String, default: "" },
	deadline: { type: Date, default: Date.now }
});

export default model<ITodoSchema>("Todo", TodoSchema) as ITodoModel;
