import { Document, Schema, Model, model } from "mongoose";
import { ObjectID } from "bson";
import { IUserSchema } from "../User";

import * as moment from "moment";
import "moment-timezone";
import Comment, { IComment, ICommentSchema } from "./Post/Comment";
import { StatusError } from "../../modules/Send-Rule";
import { IClubSchema } from "../Club";
moment.tz.setDefault("Asia/Seoul");
moment.locale("ko");

/**
 * @description Post 요구 데이터
 */
export interface IPost {
	club?: ObjectID; // 소속동아리
	owner?: ObjectID; // 주인
	title: string; // 제목
	content: string; // 내용
	comments: ObjectID[]; // 댓글들 ICommentSchema
	likes: ObjectID[]; // 좋아요들 IUserSchema
	isPublic: boolean; // 공개 여부
	imgPath?: string[]; // 이미지들
	createAt?: Date; // 생성일
	timeString?: String;
}
/**
 * @description Post 스키마에 대한 메서드 ( 레코드 )
 */
export interface IPostSchema extends IPost, Document {
	/**
	 * @description 이 글을 삭제합니다.
	 * @returns {Promise<boolean>} 성공 여부를 반환합니다.
	 */
	removePost(): Promise<any>;
	/**
	 * @description 이 글의 정보를 반환합니다.
	 * @param {IUser}data 글의 바꿀 정보
	 * @returns {Promise<IPostSchema>} 작업이 완료된 후 그 글를 반환합니다.
	 */
	changeInfomation(data: IPost): Promise<IPostSchema>;
	/**
	 * @description 이 글의 주인인지 아닌지를 판단합니다
	 * @param owner 비교할 주인
	 * @returns {boolean} 주인 여부를 반환합니다.
	 */
	checkOwner(user: IUserSchema): boolean;
	checkClub(user: IClubSchema): boolean;
	/**
	 * @description 글이 써진 시간을 현제 시간과 계산하여 문자열로 반환합니다.
	 * @returns {string} 글이 몇 분 전에 써졌는지 반환합니다.
	 */
	getLastTime(): string;
	getComments(): Promise<ICommentSchema[]>;
	pushComment(user: IUserSchema, data: IComment): Promise<IPostSchema>;
	removeComment(comment: ICommentSchema): Promise<IPostSchema>;
	toggleLike(user: IUserSchema): Promise<IPostSchema>;
}
/**
 * @description Post 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IPostModel extends Model<IPostSchema> {
	/**
	 * @description title과 content 필드의 유효성을 검사합니다.
	 * @param {any}data 체크 할 객체
	 * @returns {boolean} 유효성 결과
	 */
	dataCheck(data: any): boolean;
	/**
	 * @description 글을 생성한 후 그 글를 반환합니다.
	 * @param {IUser}data 생성할 글 데이터
	 * @returns {Promise<IUserSchema>} 입력받은 데이터에 대한 글입니다.
	 */
	createPost(club: IClubSchema, owner: IUserSchema, data: IPost): Promise<IPostSchema>;
	/**
	 * @description 글의 아이디을 입력받아 일치하는 글를 반환합니다.
	 * @param {ObjectID}id 찾을 글의 _id(ObjectID)
	 * @returns {Promise<IPostSchema>} 일치하는 글를 반환합니다.
	 */
	findByID(id: ObjectID): Promise<IPostSchema>;
	/**
	 * @description 글의 주인을 입력받아 일치하는 글를 반환합니다.
	 * @param {IUserSchema}owner 찾을 글의 주인
	 * @returns {Promise<IPostSchema>} 일치하는 글를 반환합니다.
	 */
	findByOwner(owner: IUserSchema): Promise<IPostSchema[]>;
}

const PostSchema: Schema = new Schema({
	club: { type: ObjectID, required: true },
	owner: { type: ObjectID, required: true, ref: "User" },
	title: { type: String, required: true },
	content: { type: String, required: true },
	comments: [{ type: ObjectID, ref: "Comment" }],
	likes: { type: Array, default: [] },
	imgPath: { type: Array, default: [] },
	isPublic: { type: Boolean, default: false },
	createAt: { type: Date, default: Date.now },
	timeString: { type: String }
});

PostSchema.methods.getComments = function(this: IPostSchema): Promise<ICommentSchema[]> {
	return new Promise<ICommentSchema[]>((resolve, reject) => {
		Comment.find({ _id: this.comments })
			.populate("owner", "name imgPath")
			.then(comments => {
				resolve(comments);
			})
			.catch(err => reject(err));
	});
};
PostSchema.methods.pushComment = function(this: IPostSchema, user: IUserSchema, data: IComment): Promise<IPostSchema> {
	return new Promise<IPostSchema>((resolve, reject) => {
		let comment = new Comment(data);
		comment.owner = user._id;
		comment
			.save()
			.then(comment => {
				this.comments.push(comment._id);
				this.save()
					.then(post => resolve(post))
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
PostSchema.methods.removeComment = function(this: IPostSchema, comment: ICommentSchema): Promise<IPostSchema> {
	return new Promise<IPostSchema>((resolve, reject) => {
		let idx = this.comments.indexOf(comment._id);
		comment
			.remove()
			.then(() => {
				if (idx != -1) {
					this.comments.splice(idx, 1);
				}
				this.save()
					.then(post => resolve(post))
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};
PostSchema.methods.toggleLike = function(this: IPostSchema, user: IUserSchema): Promise<IPostSchema> {
	return new Promise<IPostSchema>((resolve, reject) => {
		let idx = this.likes.indexOf(user._id);
		if (idx == -1) this.likes.push(user._id);
		else this.likes.splice(idx, 1);
		this.save()
			.then(post => resolve(post))
			.catch(err => reject(err));
	});
};

PostSchema.methods.removePost = function(this: IPostSchema): Promise<any> {
	return this.remove();
};
PostSchema.methods.changeInfomation = function(this: IPostSchema, data: IPost): Promise<IPostSchema> {
	Object.keys(data).forEach(x => {
		if (x in this && (x != "owner" && x != "createAt" && x != "_id")) this[x] = data[x] || this[x];
	});
	return this.save();
};
PostSchema.methods.checkOwner = function(this: IPostSchema, user: IUserSchema): boolean {
	return user._id.equals(this.owner);
};
PostSchema.methods.checkClub = function(this: IPostSchema, club: IClubSchema): boolean {
	return club._id.equals(this.club);
};
PostSchema.methods.getLastTime = function(this: IPostSchema): string {
	return moment(this.createAt)
		.startOf()
		.fromNow();
};

PostSchema.statics.dataCheck = function(this: IPostSchema, data: any): boolean {
	return "title" in data && "content" in data;
};
PostSchema.statics.createPost = function(this: IPostModel, club: IClubSchema, owner: IUserSchema, data: IPost): Promise<IPostSchema> {
	return new Promise((resolve, reject) => {
		data.owner = owner._id;
		data.club = club._id;
		let post = new this(data);
		post.save()
			.then((data: IPostSchema) => {
				resolve(data);
			})
			.catch(err => reject(err));
	});
};
PostSchema.statics.findByID = function(this: IPostModel, id: ObjectID): Promise<IPostSchema> {
	return new Promise((resolve, reject) => {
		this.findOne({ _id: id })
			.then((data: IPostSchema) => {
				resolve(data);
			})
			.catch(err => reject(err));
	});
};
PostSchema.statics.findByOwner = function(this: IPostModel, owner: IUserSchema): Promise<IPostSchema[]> {
	return new Promise((resolve, reject) => {
		this.find({ owner: owner._id })
			.then((data: IPostSchema[]) => {
				resolve(data);
			})
			.catch(err => reject(err));
	});
};

export default model<IPostSchema>("Post", PostSchema) as IPostModel;
