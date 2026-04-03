
import { GoogleGenAI } from "@google/genai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import FormData from "form-data";
import { cloudinary } from "../configs/cloudinary.js";
import fs from "fs";
import { chunkText, embedAndStoreChunks, retrieveRelevantChunks } from "../utils/rag.js";
import { extractTextFromPdf } from "../utils/pdfExtract.js";



const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { prompt, length, useKnowledgeBase } = req.body;

    let finalPrompt = prompt;

    // RAG: retrieve relevant chunks from user's knowledge base
    if (useKnowledgeBase) {
      const relevantChunks = await retrieveRelevantChunks(userId, prompt, 5);

      if (relevantChunks.length > 0) {
        const context = relevantChunks
          .map((chunk, i) => `[Source ${i + 1}]:\n${chunk.content}`)
          .join("\n\n");

        finalPrompt = `You are writing an article using the author's personal reference material as context.

REFERENCE MATERIAL:
${context}



ORIGINAL REQUEST:
${prompt}`;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
      config: {
        maxOutputTokens: length,
      },
    });

    const content =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ success: true, content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

  

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const { plan, free_usage } = req;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit exceeded",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 100,
      },
    });

    const content = response.text;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: error.message });
  }
};




export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    console.log("PLAN INSIDE generateImage:", req.plan);


    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;


    const uploadResponse = await cloudinary.uploader.upload(base64Image);

    const secure_url = uploadResponse.secure_url;

   await sql`
  INSERT INTO creations (user_id, prompt, content, type, pusblish)
  VALUES (${userId}, ${prompt}, ${secure_url}, 'image', TRUE)
`;


    return res.json({
      success: true,
      content: secure_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Image generation failed",
      error: error.message,
    });
  }
};



export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth(); // ✅ FIX
    const plan = req.plan;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type,pusblish)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image', TRUE)
    `;

    return res.json({
      success: true,
      content: secure_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Background removal failed",
    });
  }
};


export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const plan = req.plan;
    const { object } = req.body;

    if (!req.file || !object) {
      return res.status(400).json({
        success: false,
        message: "Image and object description required",
      });
    }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // 1️⃣ Upload original image
    const upload = await cloudinary.uploader.upload(req.file.path);

    // 2️⃣ Try GenAI remove
    const result = await cloudinary.uploader.explicit(upload.public_id, {
      type: "upload",
      resource_type: "image",
      eager: [
        {
          effect: `gen_remove:${object}`,
        },
      ],
    });

    // 🔴 SAFETY CHECK (THIS FIXES YOUR ERROR)
    if (!result.eager || !result.eager.length) {
      return res.status(400).json({
        success: false,
        message:
          "Object removal failed. Cloudinary GenAI is not enabled or prompt is unsupported.",
      });
    }

    const imageUrl = result.eager[0].secure_url;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, pusblish)
      VALUES (
        ${userId},
        ${`Removed ${object} from image`},
        ${imageUrl},
        'image',
        TRUE
      )
    `;

    return res.json({
      success: true,
      content: imageUrl,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 5MB limit",
      });
    }

    // Dynamic import - only loads when this function is called
    const pdfParse = (await import("pdf-parse")).default;

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdfParse(dataBuffer);

    const prompt = `
Review the following resume and provide detailed feedback on:
- Skills
- Formatting
- Clarity
- Improvements

Resume content:
${pdfData.text}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { maxOutputTokens: 1000 },
    });

    const content = response.text;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Resume Review', ${content}, 'resume-review')
    `;

    return res.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --- RAG: Knowledge Base Endpoints ---

export const uploadDocument = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    let text;

    if (ext === "pdf") {
      text = await extractTextFromPdf(req.file.path);
    } else {
      text = fs.readFileSync(req.file.path, "utf-8");
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Could not extract text from file" });
    }

    const chunks = chunkText(text);

    const [doc] = await sql`
      INSERT INTO documents (user_id, filename, file_type, chunk_count)
      VALUES (${userId}, ${req.file.originalname}, ${ext}, ${chunks.length})
      RETURNING id, filename, file_type, chunk_count, created_at
    `;

    await embedAndStoreChunks(userId, doc.id, chunks);

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, document: doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { userId } = req.auth;

    const documents = await sql`
      SELECT id, filename, file_type, chunk_count, created_at
      FROM documents
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json({ success: true, documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { id } = req.params;

    const [doc] = await sql`
      SELECT id FROM documents WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    await sql`DELETE FROM documents WHERE id = ${id} AND user_id = ${userId}`;

    res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
