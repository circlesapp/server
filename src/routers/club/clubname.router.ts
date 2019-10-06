import { Router } from "express";
import Post from "./post/post.router";
import Award from "./award/award.router";

const router = Router();
// Routers
router.use("/post", Post);
router.use("/award", Award);

export default router;
