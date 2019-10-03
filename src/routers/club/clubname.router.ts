import { Router } from "express";
import Post from "./post/post.router";

const router = Router();
// Routers
router.use("/post", Post);

export default router;
