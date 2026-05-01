import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const notifications = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  res.json(notifications);
});

export default router;
