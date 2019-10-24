import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { GetPublicAwards, Write, Delete } from "./award.controller";

const router = Router();

// Routers
router.post("/write", PassportJWTAuth.authenticate(), Write);
router.post("/delete", PassportJWTAuth.authenticate(), Delete);
router.get("/getPublicAwards", GetPublicAwards);

export default router;
