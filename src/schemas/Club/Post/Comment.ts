import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";

/**
 * @description Comment 요구 데이터
 */
export interface IComment {
	owner: ObjectID; // 주인
	message: string; // 내용
	createAt: Date; // 생성일
}
/**
 * @description Comment 스키마에 대한 메서드 ( 레코드 )
 */
export interface ICommentSchema extends IComment, Document {}
/**
 * @description Comment 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface ICommentModel extends Model<ICommentSchema> {}

const CommentSchema: Schema = new Schema({
	owner: { type: ObjectID, required: true },
	message: { type: String, default: "" },
	createAt: { type: Date, default: Date.now }
});

export default model<ICommentSchema>("Comment", CommentSchema) as ICommentModel;
