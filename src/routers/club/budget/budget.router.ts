import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { Write, GetPublicBudgets, Delete } from "./budget.controller";

const router = Router();

// Routers
router.post("/write", PassportJWTAuth.authenticate(), Write);
router.post("/delete", PassportJWTAuth.authenticate(), Delete);
router.get("/getPublicBudgets", GetPublicBudgets);

export default router;
