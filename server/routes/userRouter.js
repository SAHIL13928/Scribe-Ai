import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  getUserCreations,
  toggleLikeCreation,
  saveCreation,
  getPublishedCreations,
} from "../controllers/userController.js";

const userRouter = express.Router();

// SAVE creation
userRouter.post("/save-creation", auth, saveCreation);

// FETCH creations (dashboard)
userRouter.get("/get-creations", auth, getUserCreations);

userRouter.get("/get-published-creations", getPublishedCreations);

// LIKE / UNLIKE
userRouter.post("/toggle-like-creations", auth, toggleLikeCreation);

export default userRouter;
