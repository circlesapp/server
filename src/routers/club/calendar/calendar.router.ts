import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { Write, Delete, GetPublicCalendars } from "./calendar.controller";

const router = Router();

// Routers
router.post("/write", PassportJWTAuth.authenticate(), Write);
router.get("/getPublicCalendars", PassportJWTAuth.authenticate(), GetPublicCalendars);
router.post("/delete", PassportJWTAuth.authenticate(), Delete);

export default router;
