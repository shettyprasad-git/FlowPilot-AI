import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createId, memoryStore, publicUser } from "../lib/memoryStore.js";
import { createToken } from "../lib/token.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, preferences } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: "Name, valid email, and 6+ character password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);

    const defaultPrefs = { goals: "", workStyle: "Focused", tone: "Professional", focusArea: "General", activeHours: "9 AM - 5 PM" };

    if (req.app.locals.useMemory) {
      if (memoryStore.users.some((user) => user.email === normalizedEmail)) {
        return res.status(409).json({ message: "Email is already registered" });
      }
      const user = { 
        id: createId(), 
        name: name.trim(), 
        email: normalizedEmail, 
        passwordHash, 
        preferences: preferences ? { ...defaultPrefs, ...preferences } : defaultPrefs,
        createdAt: new Date() 
      };
      memoryStore.users.push(user);
      return res.status(201).json({ token: createToken(user), user: publicUser(user) });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: "Email is already registered" });

    const user = await User.create({ 
      name: name.trim(), 
      email: normalizedEmail, 
      passwordHash,
      preferences: preferences ? { ...defaultPrefs, ...preferences } : defaultPrefs
    });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const normalizedEmail = email.toLowerCase().trim();
    const user = req.app.locals.useMemory
      ? memoryStore.users.find((item) => item.email === normalizedEmail)
      : await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = req.app.locals.useMemory
      ? memoryStore.users.find((u) => u.id === req.userId)
      : await User.findById(req.userId);
      
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
});

router.put("/preferences", requireAuth, async (req, res, next) => {
  try {
    const { name, ...preferences } = req.body;
    
    if (req.app.locals.useMemory) {
      const user = memoryStore.users.find((u) => u.id === req.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (name) user.name = name.trim();
      user.preferences = { ...user.preferences, ...preferences };
      return res.json(publicUser(user));
    }
    
    const updateObj = { preferences };
    if (name) updateObj.name = name.trim();
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateObj },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
});

export default router;
