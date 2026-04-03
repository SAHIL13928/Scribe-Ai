import fs from "fs";

/**
 * Extract text from a PDF file at the given path.
 * Uses dynamic import of pdf-parse (matching existing pattern in aiController.js).
 */
export async function extractTextFromPdf(filePath) {
  const pdfParse = (await import("pdf-parse")).default;
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}
