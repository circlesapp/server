import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { Apply, Modification, GetMyApplicant } from "./applicant.controller";

const router = Router();

// Routers
router.post("/apply", PassportJWTAuth.authenticate(), Apply);
router.post("/modification", PassportJWTAuth.authenticate(), Modification);
router.get("/getMyApplicant", PassportJWTAuth.authenticate(), GetMyApplicant);

export default router;
