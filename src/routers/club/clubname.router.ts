import { Router } from "express";
import Admin from "./admin/admin.router";
import Post from "./post/post.router";
import Award from "./award/award.router";
import Budget from "./budget/budget.router";
import Member from "./member/member.router";
import Applicant from "./applicant/applicant.router";

const router = Router();
// Routers
router.use("/admin", Admin);
router.use("/post", Post);
router.use("/award", Award);
router.use("/budget", Budget);
router.use("/member", Member);
router.use("/applicant", Applicant);

export default router;
