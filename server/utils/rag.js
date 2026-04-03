import { GoogleGenAI } from "@google/genai";
import sql from "../configs/db.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Split text into chunks of ~1000 chars with 200-char overlap,
 * respecting sentence boundaries.
 */
export function chunkText(text, maxChunkSize = 1000, overlap = 200) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+[\s]*/g) || [cleaned];

  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Keep the tail of the current chunk as overlap for the next
      currentChunk = currentChunk.slice(-overlap) + sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Embed a single text string using Gemini text-embedding-004.
 * Returns a 768-dimensional number array.
 */
export async function embedText(text) {
  const result = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: text,
  });
  return result.embeddings[0].values;
}

/**
 * Embed and store all chunks for a document.
 * Returns the number of chunks created.
 */
export async function embedAndStoreChunks(userId, documentId, chunks) {
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]);
    const embeddingStr = `[${embedding.join(",")}]`;

    await sql`
      INSERT INTO document_chunks (document_id, user_id, chunk_index, content, embedding)
      VALUES (${documentId}, ${userId}, ${i}, ${chunks[i]}, ${embeddingStr}::vector)
    `;
  }
  return chunks.length;
}

/**
 * Retrieve top-k most similar chunks for a query, scoped to a user.
 * Returns array of { content, similarity } objects.
 */
export async function retrieveRelevantChunks(userId, queryText, topK = 5) {
  const queryEmbedding = await embedText(queryText);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const results = await sql`
    SELECT content,
           1 - (embedding <=> ${embeddingStr}::vector) AS similarity
    FROM document_chunks
    WHERE user_id = ${userId}
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${topK}
  `;

  return results;
}
