import { Router } from "express";
import { GetPublicMembers } from "./member.controller";

const router = Router();

// Routers
router.get("/getPublicMembers", GetPublicMembers);

export default router;
