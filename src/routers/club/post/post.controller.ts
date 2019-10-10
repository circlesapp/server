import { Request, Response, NextFunction } from "express";
import { IUserSchema } from "../../../schemas/User";
import Post, { IPost, IPostSchema } from "../../../schemas/Club/Post";
import SendRule, { StatusError, HTTPRequestCode } from "../../../modules/Send-Rule";
import * as fs from "fs";
import Base64ToImage from "../../../modules/Base64-To-Image";
import { IClubSchema, Permission } from "../../../schemas/Club";

/**
 * @description 글쓰기 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const Write = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body as IPost;
	let imageData = (req.body.img as string[]) || []; // img
	if (!user.isJoinClub(club)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "소속된 동아리가 아님"));
	} else if (!club.checkPermission(Permission.ACCESS_POST_CREATE, user)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "동아리 내부 권한 없음"));
	}
	if (!Post.dataCheck(data)) {
		return next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
	if (imageData.length > 0) {
		// img
		Post.createPost(club, user, data)
			.then((post: IPostSchema) => {
				try {
					imageData.forEach((x, idx) => {
						let data = Base64ToImage.getImageData(x);
						let path = `post/${post._id}_${idx}.${data.imgType}`;
						fs.writeFileSync(`public/${path}`, data.imgFile);
						post.imgPath.push(path);
					});
					post.save()
						.then(post => {
							SendRule.response(res, HTTPRequestCode.CREATE, post, "글 작성 성공");
						})
						.catch(err => next(err));
				} catch (err) {
					next(err);
				}
			})
			.catch(err => next(err));
	} else {
		Post.createPost(club, user, data)
			.then((post: IPostSchema) => {
				SendRule.response(res, HTTPRequestCode.CREATE, post, "글 작성 성공");
			})
			.catch(err => next(err));
	}
};
/**
 * @description 모든 공개 글을 반환하는 라우터 입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const GetPublicPosts = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;

	club.getClubPosts()
		.then((posts: IPostSchema[]) => {
			SendRule.response(
				res,
				HTTPRequestCode.OK,
				posts.map(x => {
					x.timeString = x.getLastTime();
					return x;
				})
			);
		})
		.catch(err => next(err));
};
/**
 * @description 글수정 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const Modification = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body;
	if (!user.isJoinClub(club)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "소속된 동아리가 아님"));
	} else if (!club.checkPermission(Permission.ACCESS_POST_CREATE, user)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "동아리 내부 권한 없음"));
	}
	if (!("_id" in data)) {
		return next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
    Post.findByID(data._id).then(post => {
        if(!post){
            return next(new StatusError(HTTPRequestCode.NOT_FOUND, "존재하지 않는 글"))
        }
		if (!post.checkClub(club)) {
			return next(new StatusError(HTTPRequestCode.BAD_REQUEST, "동아리 소속이 잘못 됨"));
		}
		if (!(post.checkOwner(user) || club.checkAdmin(user))) {
			return SendRule.response(res, HTTPRequestCode.FORBIDDEN, undefined, "권한 없음");
		}
		post.changeInfomation(data)
			.then(post => {
				SendRule.response(res, 200, post, "글 수정 성공");
			})
			.catch(err => next(err));
	});
};
/**
 * @description 글삭제 라우터입니다.
 * @param {Request}req Express req
 * @param {Response}res Express res
 * @param {NextFunction}next Express next
 */
export const Delete = function(req: Request, res: Response, next: NextFunction) {
	let user = req.user as IUserSchema;
	let club = (req as any).club as IClubSchema;
	let data = req.body;

	if (!user.isJoinClub(club)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "소속된 동아리가 아님"));
	} else if (!club.checkPermission(Permission.ACCESS_POST_DELETE, user)) {
		return next(new StatusError(HTTPRequestCode.FORBIDDEN, "동아리 내부 권한 없음"));
	}
	if (!("_id" in data)) {
		return next(new StatusError(HTTPRequestCode.BAD_REQUEST, "잘못된 요청"));
	}
	Post.findByID(data._id).then(post => {
		if (!post.checkClub(club)) {
			return next(new StatusError(HTTPRequestCode.BAD_REQUEST, "동아리 소속이 잘못 됨"));
		}
		if (!(post.checkOwner(user) || club.checkAdmin(user))) {
			return SendRule.response(res, HTTPRequestCode.FORBIDDEN, undefined, "권한 없음");
		}
		post.removePost()
			.then((post: IPostSchema) => {
				if (post.imgPath) {
					try {
						post.imgPath.forEach(path => {
							fs.unlinkSync(`public/${path}`);
						});
						SendRule.response(res, 200, post, "글 제거 성공");
					} catch (err) {
						next(err);
					}
				} else {
					SendRule.response(res, 200, post, "글 제거 성공");
				}
			})
			.catch(err => next(err));
	});
};
