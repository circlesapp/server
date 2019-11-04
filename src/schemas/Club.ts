import { Document, Schema, Model, model } from "mongoose";
import { ObjectID, ObjectId } from "bson";
import Budget, { IBudgetSchema } from "./Club/Budget";
import Award, { IAwardSchema } from "./Club/Award";
import Applicant, { IApplicantSchema, IApplicant } from "./Club/Applicant";
import { StatusError } from "../modules/Send-Rule";
import User, { IUserSchema } from "./User";
import Post, { IPostSchema } from "./Club/Post";

export enum Permission {
	ACCESS_POST_CREATE = 1, // 글 생성 권한
	ACCESS_POST_READ = 2, // 글 읽기 권한
	ACCESS_POST_DELETE = 3, // 글 삭제 권한

	ACCESS_AWARDS_CREATE = 11, // 수상 생성 권한
	ACCESS_AWARDS_READ = 12, // 수상 읽기 권한
	ACCESS_AWARDS_DELETE = 13, // 수상 삭제 권한

	ACCESS_BUDGETS_CREATE = 21, // 에산서 생성 권한
	ACCESS_BUDGETS_READ = 22, // 예산서 읽기 권한
	ACCESS_BUDGETS_DELETE = 23, // 예산서 삭제 권한

	ACCESS_APPLYCANT_READ = 31, // 지원서 읽기 권한
	ACCESS_APPLYCANT_DELETE = 32 // 지원서 삭제 권한
}
export interface Member {
	user: ObjectID; // 유저 아이디
	rank: number; // 랭크 코드
}
export interface Rank {
	id: number;
	name: string; // 랭크 이름
	isAdmin?: boolean; // 어드민 권한
	permission: Permission[]; // 권한들
}
/**
 * @description User 요구 데이터
 */
export interface IClub {
	name: string; // 동아리 이름
	owner: ObjectID;
	imgPath: string;
	school: string;
	introduction: string;
	members?: Member[]; // 동아리 회원
	ranks?: Rank[]; // 동아리 계급들
	createAt?: Date;
}
/**
 * @description User 스키마에 대한 메서드 ( 레코드 )
 */
export interface IClubSchema extends IClub, Document {
	changeInfomation(data: IClub): Promise<IClubSchema>;
	getClubMembers(): Promise<IUserSchema[]>;
	getDetailMembers(): Promise<Member[]>;
	getClubPosts(): Promise<IPostSchema[]>;
	getClubBudgets(): Promise<IBudgetSchema[]>;
	getClubAwards(): Promise<IAwardSchema[]>;
	getClubApplicants(): Promise<IApplicantSchema[]>;

	checkPermission(permission: Permission, user: IUserSchema);
	checkAdmin(user: IUserSchema);

	acceptApplicant(applicantId: ObjectID): Promise<IApplicantSchema>;
}
/**
 * @description User 모델에 대한 정적 메서드 ( 테이블 )
 */
export interface IClubModel extends Model<IClubSchema> {
	/**
	 * @description 동아리를 생성한 후 그 동아리를 반환합니다.
	 * @param {IUser}data 생성할 동아리 데이터
	 * @returns {Promise<IUserSchema>} 입력받은 데이터에 대한 동아리입니다.
	 */
	createClub(owner: IUserSchema, data: IClub): Promise<IClubSchema>;
	/**
	 * @description 동아리 이름을 입력받아 일치하는 동아리를 반환합니다.
	 * @param {string}email 찾을 동아리 이름
	 * @returns {Promise<IUserSchema>} 일치하는 동아리를 반환합니다.
	 */
	findByName(name: string): Promise<IClubSchema>;
	/**
	 * @description 아이디을 입력받아 일치하는 동아리를 반환합니다.
	 * @param {string}email 찾을 동아리의 아이디
	 * @returns {Promise<IUserSchema>} 일치하는 동아리를 반환합니다.
	 */
	findByID(_id: ObjectID): Promise<IClubSchema>;
	/**
	 * @description 동아리 이름을 입력받아 동아리 유무를 반환합니다.
	 * @param email 검사 할 동아리 이름
	 * @returns {boolean} 동아리의 유무를 반환합니다.
	 */
	checkPresentClub(name: string): Promise<boolean>;
}
const defaultRank: Rank[] = [
	{
		id: 0,
		name: "admin",
		isAdmin: true,
		permission: []
	},
	{
		id: 1,
		name: "default",
		isAdmin: false,
		permission: [Permission.ACCESS_AWARDS_READ, Permission.ACCESS_BUDGETS_READ, Permission.ACCESS_POST_CREATE, Permission.ACCESS_POST_READ, Permission.ACCESS_POST_DELETE]
	}
];
const ClubSchema: Schema = new Schema({
	name: { type: String, required: true, unique: true },
	owner: { type: Schema.Types.ObjectId, required: true, ref: "User" },
	imgPath: { type: String, default: "" },
	school: { type: String, default: "" },
	introduction: { type: String, default: "" },
	members: { type: Array, default: [], ref: "User" },
	ranks: { type: Array, default: defaultRank },
	createAt: { type: Date, default: Date.now }
});

ClubSchema.methods.changeInfomation = function(this: IClubSchema, data: IClub): Promise<IClubSchema> {
	Object.keys(data).forEach(x => {
		if (x in this && (x != "owner" && x != "createAt" && x != "_id" && x != "imgPath")) {
			if (x == "members") {
				this[x] = data[x].map(y => {
					y.user = new ObjectId(y.user);
					return y;
                });
                console.log(this[x])
			} else this[x] = data[x] || this[x];
		}
	});
	return this.save();
};

ClubSchema.methods.getClubMembers = function(this: IClubSchema): Promise<IUserSchema[]> {
	return new Promise<IUserSchema[]>((resolve, reject) => {
		User.find({ _id: this.members.map(user => user.user) }, { name: 1, imgPath: 1 })
			.populate("owner", "name imgPath")
			.sort({ createAt: -1 })
			.then(users => {
				resolve(users);
			})
			.catch(err => reject(err));
	});
};
ClubSchema.methods.getDetailMembers = function(this: IClubSchema): Promise<Member[]> {
	return new Promise<Member[]>((resolve, reject) => {
		this.populate({ path: "members.user", model: User, select: "name imgPath" })
			.execPopulate()
			.then(club => resolve(club.members))
			.catch(err => reject(err));
	});
};

ClubSchema.methods.getClubPosts = function(this: IClubSchema): Promise<IPostSchema[]> {
	return new Promise<IPostSchema[]>((resolve, reject) => {
		Post.find({ club: this._id })
			.populate("owner", "name imgPath")
			.sort({ createAt: -1 })
			.then(posts => {
				resolve(posts);
			})
			.catch(err => reject(err));
	});
};
ClubSchema.methods.getClubBudgets = function(this: IClubSchema): Promise<IBudgetSchema[]> {
	return new Promise<IBudgetSchema[]>((resolve, reject) => {
		Budget.find({ club: this._id })
			.then(budgets => resolve(budgets))
			.catch(err => reject(err));
	});
};
ClubSchema.methods.getClubAwards = function(this: IClubSchema): Promise<IAwardSchema[]> {
	return new Promise<IAwardSchema[]>((resolve, reject) => {
		Award.find({ club: this._id })
			.populate("target", "name imgPath")
			.then(awards => resolve(awards))
			.catch(err => reject(err));
	});
};
ClubSchema.methods.getClubApplicants = function(this: IClubSchema): Promise<IApplicantSchema[]> {
	return new Promise<IApplicantSchema[]>((resolve, reject) => {
		Applicant.find({ club: this._id })
			.populate("owner", "name imgPath")
			.then(applicants => resolve(applicants))
			.catch(err => reject(err));
	});
};

ClubSchema.methods.checkPermission = function(this: IClubSchema, permission: Permission, user: IUserSchema): boolean {
	if (user.isJoinClub(this)) {
		let userMember = this.members.find(member => user._id.equals(member.user));
		let userRank = this.ranks.find(rank => rank.id == userMember.rank);
		if (userRank.isAdmin == true) return true;
		else return userRank.permission.indexOf(permission) != -1;
	} else {
		return false;
	}
};
ClubSchema.methods.checkAdmin = function(this: IClubSchema, user: IUserSchema): boolean {
	if (user.isJoinClub(this)) {
		let userMember = this.members.find(member => user._id.equals(member.user));
		let userRank = this.ranks.find(rank => rank.id == userMember.rank);
		return userRank.isAdmin;
	} else {
		return false;
	}
};
ClubSchema.methods.acceptApplicant = function(this: IClubSchema, applicantId: ObjectID): Promise<IApplicantSchema> {
	return new Promise<IApplicantSchema>((resolve, reject) => {
		Applicant.findOne({ _id: applicantId })
			.then(applicant => {
				User.findById(applicant.owner)
					.then(user => {
						user.removeApplicant(applicant)
							.then(user => {
								user.joinClub(this)
									.then(user => {
										resolve(applicant);
									})
									.catch(err => reject(err));
							})
							.catch(err => reject(err));
					})
					.catch(err => reject(err));
			})
			.catch(err => reject(err));
	});
};

ClubSchema.statics.createClub = function(this: IClubModel, owner: IUserSchema, data: IClub): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		this.checkPresentClub(data.name).then(check => {
			if (!check) {
				let club = new this(data);
				club.owner = owner._id;
				club.members.push({
					user: owner._id,
					rank: 0
				});
				club.save()
					.then(club => {
						owner.clubs.push(club._id);
						owner
							.save()
							.then(user => resolve(club))
							.catch(err => reject(err));
					})
					.catch(err => reject(err));
			} else {
				reject(new StatusError(400, "이미 있는 동아리 입니다."));
			}
		});
	});
};
ClubSchema.statics.findByName = function(this: IClubModel, name: string): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		this.findOne({ name: { $regex: name, $options: "i" } })
			.then(club => resolve(club))
			.catch(err => reject(err));
	});
};
ClubSchema.statics.findByID = function(this: IClubModel, _id: ObjectID): Promise<IClubSchema> {
	return new Promise<IClubSchema>((resolve, reject) => {
		this.findOne({ _id })
			.then(club => resolve(club))
			.catch(err => reject(err));
	});
};
ClubSchema.statics.checkPresentClub = async function(this: IClubModel, name: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		this.findOne({ name: { $regex: name, $options: "i" } })
			.then(club => {
				if (club) resolve(true);
				else resolve(false);
			})
			.catch(err => reject(err));
	});
};
export default model<IClubSchema>("Club", ClubSchema) as IClubModel;
