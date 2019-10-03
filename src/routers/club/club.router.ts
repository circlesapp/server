import { Router, Request, Response, NextFunction } from "express";
import PassportJWTAuth from "../../modules/PassportJWT-Auth";
import { Create } from "./club.controller";
import ClubName from "./clubname.router";
import { StatusError } from "../../modules/Send-Rule";
import Club from "../../schemas/Club";

const router = Router();
// Routers
router.post("/create", PassportJWTAuth.authenticate(), Create);

router.use(
	"/:clubname",
	(req: Request, res: Response, next: NextFunction) => {
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
	},
	ClubName
);

export default router;
