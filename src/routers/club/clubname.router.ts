import { Router, Request, Response, NextFunction } from "express";
import PassportJWTAuth from "../../modules/PassportJWT-Auth";
import Post from "./post/post.router";
import { StatusError } from "../../modules/Send-Rule";
import Club from "../../schemas/Club";

const router = Router();
// Routers
router.use((req: Request, res: Response, next: NextFunction) => {
	if (req.params.clubname) {
		Club.findByName(req.params.clubname)
			.then(club => {
				if (club) {
					(req as any).club = club;
					next();
				} else {
					next(new StatusError(404, "존재하지 않는 동아리 입니다."));
				}
			})
			.catch(err => next(err));
	} else {
		next(new StatusError(404, "존재하지 않는 동아리 입니다."));
	}
});
router.use("/post", Post);

export default router;
