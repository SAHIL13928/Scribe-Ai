import express from "express";
import { auth } from "../middlewares/auth.js";
import { getUserCreations, toggleLikeCreation } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/get-published-creations",auth, getUserCreations);
userRouter.post("/toggle-like-creations",auth, toggleLikeCreation);
//userRouter.get("/get-published-creations",auth, getPublishedCreations);

export default userRouter;