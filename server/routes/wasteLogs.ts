import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { item_name, quantity, action } = req.body;
  await db.query("INSERT INTO waste_logs (user_id, item_name, quantity, action) VALUES (?, ?, ?, ?)", [req.user.id, item_name, quantity, action]);
  res.sendStatus(201);
});

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const logs = await db.query("SELECT * FROM waste_logs WHERE user_id = ? ORDER BY logged_at DESC", [req.user.id]);
  res.json(logs);
});

export default router;
