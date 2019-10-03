import { Router, Request, Response, NextFunction } from "express";
import PassportJWTAuth from "../../modules/PassportJWT-Auth";
import { Create } from "./club.controller";
import ClubName from "./post/post.router";

const router = Router();
// Routers
router.post("/create", PassportJWTAuth.authenticate(), Create);

router.use("/:clubname", ClubName);

export default router;
