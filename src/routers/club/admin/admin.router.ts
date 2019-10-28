import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { ChangeClubImage } from "./admin.controller";

const router = Router();

// Routers
router.post("/changeClubImage", PassportJWTAuth.authenticate(), ChangeClubImage);

export default router;
