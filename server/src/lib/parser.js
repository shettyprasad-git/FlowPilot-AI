import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");

/**
 * Extracts raw text from a file buffer based on its MIME type.
 * Supports: PDF, DOCX (Word), Images (via Tesseract OCR), and Plain Text.
 * @param {Buffer} buffer 
 * @param {string} mimeType 
 * @returns {Promise<string>}
 */
export async function parseFile(buffer, mimeType) {
  if (mimeType === "application/pdf") {
    const data = await pdf(buffer);
    return data.text || "";
  }
  
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const data = await mammoth.extractRawText({ buffer });
    return data.value || "";
  }
  
  if (mimeType.startsWith("image/")) {
    const result = await Tesseract.recognize(buffer, "eng");
    return result.data.text || "";
  }
  
  if (mimeType.startsWith("text/") || mimeType === "application/octet-stream") {
    return buffer.toString("utf-8");
  }
  
  throw new Error(`Unsupported file type: ${mimeType}`);
}
