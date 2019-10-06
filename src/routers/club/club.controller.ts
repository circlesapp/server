import { Response, Request, NextFunction } from "express";
import { IUserSchema } from "../../schemas/User";
import Club from "../../schemas/Club";
import SendRule, { HTTPRequestCode, StatusError } from "../../modules/Send-Rule";
import Base64ToImage from "../../modules/Base64-To-Image";
import * as fs from "fs";

export const GetClubInformation = (req: Request, res: Response, next: NextFunction) => {
	Club.findByName(req.query.name || "")
		.then(club => {
			if (club) {
				SendRule.response(res, 200, club);
			} else {
				SendRule.response(res, 200, null, "존재하지 않는 동아리");
			}
		})
		.catch(err => next(err));
};
export const GetAllClubs = (req: Request, res: Response, next: NextFunction) => {
	Club.find()
		.then(clubs => {
			SendRule.response(res, 200, clubs);
		})
		.catch(err => next(err));
};
export const Create = (req: Request, res: Response, next: NextFunction) => {
	let user = req.user as IUserSchema;
	let imageData = req.body.img as string; // img

	Club.createClub(user, req.body)
		.then(club => {
			if (imageData) {
				let data = Base64ToImage.getImageData(imageData);
				if (club.imgPath != "") {
					try {
						fs.unlinkSync(`club/${club.imgPath}`);
					} catch (err) {
						next(err);
					}
				}
				club.imgPath = `club/${club._id}.${data.imgType}`;
				fs.writeFile(`public/${club.imgPath}`, data.imgFile, err => {
					if (err) next(err);
					club.save()
						.then(club => {
							SendRule.response(res, 200, club, "동아리 생성 성공");
						})
						.catch(err => next(err));
				});
			} else {
				SendRule.response(res, 200, club, "동아리 생성 성공");
			}
		})
		.catch(err => next(err));
};
