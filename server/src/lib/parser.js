import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
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
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text || "";
    } finally {
      await parser.destroy().catch(() => {});
    }
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
