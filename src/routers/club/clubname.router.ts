import { Router } from "express";
import Post from "./post/post.router";
import Award from "./award/award.router";
import Member from "./member/member.router";

const router = Router();
// Routers
router.use("/post", Post);
router.use("/award", Award);
router.use("/member", Member);

export default router;
