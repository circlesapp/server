import { Router } from "express";
import PassportJWTAuth from "../../../modules/PassportJWT-Auth";
import { Write, Modification, Delete, GetPublicPosts } from "./post.controller";

const router = Router();

// Routers
router.post("/write", PassportJWTAuth.authenticate(), Write);
router.get("/getPublicPosts", GetPublicPosts);
router.post("/modification", PassportJWTAuth.authenticate(), Modification); // TODO:
router.post("/delete", PassportJWTAuth.authenticate(), Delete); // TODO:

export default router;
