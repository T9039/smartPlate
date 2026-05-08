import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../lib/db.js";
import { JWT_SECRET } from "../middleware/auth.js";
import { sendResetEmail } from "../lib/mailer.js";

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

router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await db.queryOne("SELECT id FROM users WHERE email = ?", [email]) as any;
  if (!user) return res.status(404).json({ error: "User not found" });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

  await db.query("UPDATE users SET reset_code = ?, reset_expires = ? WHERE id = ?", [code, expires, user.id]);

  try {
    await sendResetEmail(email, code);
    res.json({ message: "Reset code sent to email" });
  } catch (error: any) {
    console.error("Failed to send reset email:", error);
    res.status(500).json({ error: "Failed to send reset email. Please try again later." });
  }
});

router.post("/verify-reset-code", async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const user = await db.queryOne("SELECT id, reset_code, reset_expires FROM users WHERE email = ?", [email]) as any;
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.reset_code !== code) return res.status(400).json({ error: "Invalid code" });
  if (new Date(user.reset_expires) < new Date()) return res.status(400).json({ error: "Code expired" });

  res.json({ message: "Code is valid" });
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  const user = await db.queryOne("SELECT id, reset_code, reset_expires FROM users WHERE email = ?", [email]) as any;
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.reset_code !== code) return res.status(400).json({ error: "Invalid code" });
  if (new Date(user.reset_expires) < new Date()) return res.status(400).json({ error: "Code expired" });

  const hash = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE users SET password_hash = ?, reset_code = NULL, reset_expires = NULL WHERE id = ?", [hash, user.id]);

  res.json({ message: "Password reset successfully" });
});

export default router;
