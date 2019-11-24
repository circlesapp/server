import { Router } from "express";
import { Page, TestPushAlarm } from "./admin.controller";

const router = Router();

// Routers
router.get("/", Page);
router.post("/testPushAlarm", TestPushAlarm);

export default router;
