import { Router } from "express";
import { Login, GetProfile, ChangePassword, Register, WithdrawAccount, ChangeInfomation, ChangeProfileImage, GetAlarm, RemoveAlarm, RemoveAllAlarm } from "./auth.controller";
import PassportJWTAuth from "../../modules/PassportJWT-Auth";

const router = Router();

// Routers
router.post("/register", Register);
router.post("/login", Login);
router.post("/getProfile", PassportJWTAuth.authenticate(), GetProfile);
router.post("/changePassword", PassportJWTAuth.authenticate(), ChangePassword);
router.post("/changeInformation", PassportJWTAuth.authenticate(), ChangeInfomation);
router.post("/changeProfileImage", PassportJWTAuth.authenticate(), ChangeProfileImage);
router.post("/withdrawAccount", PassportJWTAuth.authenticate(), WithdrawAccount);
router.post("/getAlarm", PassportJWTAuth.authenticate(), GetAlarm);
router.post("/removeAlarm", PassportJWTAuth.authenticate(), RemoveAlarm);
router.post("/RemoveAllALarm", PassportJWTAuth.authenticate(), RemoveAllAlarm);

export default router;
