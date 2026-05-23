import express from "express";
import AIHistory from "../models/AIHistory.js";
import { createId, memoryStore } from "../lib/memoryStore.js";
import { requireAuth } from "../middleware/auth.js";
import { generateAI, parseNoteAI } from "../services/aiService.js";
import User from "../models/User.js";

const router = express.Router();
router.use(requireAuth);

async function saveHistory(req, feature, prompt, response) {
  if (req.app.locals.useMemory) {
    memoryStore.aiHistory.unshift({ id: createId(), feature, prompt, response, userId: req.userId, createdAt: new Date() });
    return;
  }
  await AIHistory.create({ feature, prompt, response, userId: req.userId });
}

async function handleAI(req, res, next, feature) {
  try {
    const prompt = req.body.prompt || req.body.content || req.body.requirement || "";
    const model = req.body.model || "Auto";
    if (!prompt.trim()) return res.status(400).json({ message: "Prompt is required" });

    let preferences = {};
    let userName = "User";
    if (req.app.locals.useMemory) {
      const user = memoryStore.users.find((u) => u.id === req.userId);
      if (user) {
        preferences = user.preferences;
        userName = user.name || "User";
      }
    } else {
      const user = await User.findById(req.userId);
      if (user) {
        preferences = user.preferences;
        userName = user.name || "User";
      }
    }

    const result = await generateAI(feature, prompt, model, preferences, userName);
    await saveHistory(req, feature, prompt, result.text);

    if (feature === "summarize") {
      return res.json({ ...parseNoteAI(result.text), provider: result.provider });
    }

    res.json({ response: result.text, provider: result.provider });
  } catch (error) {
    next(error);
  }
}

router.post("/chat", (req, res, next) => handleAI(req, res, next, "chat"));
router.post("/summarize", (req, res, next) => handleAI(req, res, next, "summarize"));
router.post("/email", (req, res, next) => handleAI(req, res, next, "email"));
router.post("/workflow", (req, res, next) => handleAI(req, res, next, "workflow"));
router.post("/planner", (req, res, next) => handleAI(req, res, next, "planner"));

export default router;
