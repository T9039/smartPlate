import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../lib/db.js";
import { JWT_SECRET } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await db.query("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, hash]) as any;
    const userId = result.insertId;
    const token = jwt.sign({ id: userId, username }, JWT_SECRET);
    res.json({ token, user: { id: userId, username, email, role: 'home', activeTheme: 'default' } });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Username or email already exists" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await db.queryOne("SELECT * FROM users WHERE email = ?", [email]) as any;
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  if (user.status === 'suspended') return res.status(403).json({ error: "Account suspended" });
  if (await bcrypt.compare(password, user.password_hash)) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        activeTheme: user.active_theme || 'default',
      },
    });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

export default router;
