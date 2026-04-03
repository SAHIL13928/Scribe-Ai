import express from "express";
import {upload} from "../configs/multer.js";


import { auth } from "../middlewares/auth.js";
import { generateArticle,generateBlogTitle,generateImage,removeImageBackground, removeImageObject, resumeReview, uploadDocument, getDocuments, deleteDocument } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/generate-blog-title", auth, generateBlogTitle);
aiRouter.post("/generate-image", auth, generateImage);
aiRouter.post("/remove-background", upload.single('image'),auth, removeImageBackground);
aiRouter.post("/remove-object", upload.single('image'),auth, removeImageObject);
aiRouter.post("/resume-review", upload.single('resume'),auth, resumeReview);

// Knowledge base routes (RAG)
aiRouter.post("/upload-document", upload.single('document'), auth, uploadDocument);
aiRouter.get("/documents", auth, getDocuments);
aiRouter.delete("/documents/:id", auth, deleteDocument);

export default aiRouter;