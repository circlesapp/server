import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";

/**
 * @description Calendar 요구 데이터
 */
export interface ICalendar {
	club: ObjectID; // 소속 동아리
	content: string; // 대회 이름
	start: Date;
	end: Date;
}
/**
 * @description Calendar 스키마에 대한 메서드 ( 레코드 )
 */
export interface ICalendarSchema extends ICalendar, Document {}
/**
 * @description Calendar 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface ICalendarModel extends Model<ICalendarSchema> {}

const CalendarSchema: Schema = new Schema({
	club: { type: ObjectID, required: true },
	content: { type: String, default: "" },
	start: { type: Date, default: Date.now },
	end: { type: Date, default: Date.now }
});

export default model<ICalendarSchema>("Calendar", CalendarSchema) as ICalendarModel;
