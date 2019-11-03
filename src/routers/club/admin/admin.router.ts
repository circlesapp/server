import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { ChangeClubImage, Modification } from "./admin.controller";

const router = Router();

// Routers
router.post("/changeClubImage", PassportJWTAuth.authenticate(), ChangeClubImage);
router.post("/Modification", PassportJWTAuth.authenticate(), Modification);

export default router;
