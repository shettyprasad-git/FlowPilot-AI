import express from "express";
import multer from "multer";
import Note from "../models/Note.js";
import { createId, memoryStore } from "../lib/memoryStore.js";
import { requireAuth } from "../middleware/auth.js";
import { generateAI, parseNoteAI } from "../services/aiService.js";
import { parseFile } from "../lib/parser.js";

const router = express.Router();
router.use(requireAuth);

function normalizeNote(note) {
  return {
    id: note.id || note._id.toString(),
    title: note.title,
    content: note.content,
    summary: note.summary,
    keyPoints: note.keyPoints || [],
    actionItems: note.actionItems || [],
    flashcards: note.flashcards || [],
    createdAt: note.createdAt
  };
}

router.get("/", async (req, res, next) => {
  try {
    const notes = req.app.locals.useMemory
      ? memoryStore.notes.filter((note) => note.userId === req.userId)
      : await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(notes.map(normalizeNote));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and note content are required" });

    const ai = await generateAI("summarize", content);
    const parsed = parseNoteAI(ai.text);
    const payload = { title, content, ...parsed, userId: req.userId };

    if (req.app.locals.useMemory) {
      const note = { id: createId(), ...payload, createdAt: new Date() };
      memoryStore.notes.unshift(note);
      return res.status(201).json({ ...normalizeNote(note), provider: ai.provider });
    }

    const note = await Note.create(payload);
    res.status(201).json({ ...normalizeNote(note), provider: ai.provider });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (req.app.locals.useMemory) {
      const index = memoryStore.notes.findIndex((item) => item.id === req.params.id && item.userId === req.userId);
      if (index === -1) return res.status(404).json({ message: "Note not found" });
      memoryStore.notes.splice(index, 1);
      return res.status(204).end();
    }

    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post("/parse", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const text = await parseFile(req.file.buffer, req.file.mimetype);
    let title = req.file.originalname || "Parsed Document";
    const dotIndex = title.lastIndexOf(".");
    if (dotIndex !== -1) title = title.substring(0, dotIndex);
    res.json({ title, text: text.trim() });
  } catch (error) {
    next(error);
  }
});

export default router;
