import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { Apply, Modification, GetMyApplicant, GetClubApplications, Accept } from "./applicant.controller";

const router = Router();

// Routers
router.post("/apply", PassportJWTAuth.authenticate(), Apply);
router.post("/modification", PassportJWTAuth.authenticate(), Modification);
router.post("/getClubApplications", PassportJWTAuth.authenticate(), GetClubApplications);
router.get("/getMyApplicant", PassportJWTAuth.authenticate(), GetMyApplicant);

router.post("/accept", PassportJWTAuth.authenticate(), Accept);
export default router;
