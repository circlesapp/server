import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { GetPublicMembers } from "./member.controller";

const router = Router();

// Routers
router.get("/getPublicMembers", GetPublicMembers);

export default router;
