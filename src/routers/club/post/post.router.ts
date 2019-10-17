import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { Write, Modification, Delete, GetPublicPosts, GetPublicPostComments, CommentWrite, CommentDelete } from "./post.controller";

const router = Router();

// Routers
router.post("/write", PassportJWTAuth.authenticate(), Write);
router.get("/getPublicPostComments", GetPublicPostComments);
router.get("/getPublicPosts", GetPublicPosts);
router.post("/modification", PassportJWTAuth.authenticate(), Modification);
router.post("/delete", PassportJWTAuth.authenticate(), Delete);

router.post("/comment/write", PassportJWTAuth.authenticate(), CommentWrite);
router.post("/comment/delete", PassportJWTAuth.authenticate(), CommentDelete);

export default router;
