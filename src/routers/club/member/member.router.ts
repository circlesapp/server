import { Router } from "express";
import { GetPublicMembers, GetDetailMembers } from "./member.controller";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";

const router = Router();

// Routers
router.get("/getPublicMembers", GetPublicMembers);
router.post("/getDetailMembers", PassportJWTAuth.authenticate(), GetDetailMembers);

export default router;
