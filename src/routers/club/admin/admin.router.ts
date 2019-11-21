import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { ChangeClubImage, Modification, Closure, FireMember } from "./admin.controller";

const router = Router();

// Routers
router.post("/fireMember", PassportJWTAuth.authenticate(), FireMember);
router.post("/closure", PassportJWTAuth.authenticate(), Closure);
router.post("/changeClubImage", PassportJWTAuth.authenticate(), ChangeClubImage);
router.post("/modification", PassportJWTAuth.authenticate(), Modification);

export default router;
