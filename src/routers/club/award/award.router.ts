import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { GetPublicAwards, Write } from "./award.controller";

const router = Router();

// Routers
router.post("/write",PassportJWTAuth.authenticate(),Write)
router.get("/getPublicAwards", GetPublicAwards);

export default router;
