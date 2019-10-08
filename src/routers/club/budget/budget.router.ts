import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { Write, GetPublicBudgets } from "./budget.controller";

const router = Router();

// Routers
router.post("/write", PassportJWTAuth.authenticate(), Write);
router.get("/getPublicBudgets", GetPublicBudgets);

export default router;
