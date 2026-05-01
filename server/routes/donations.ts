import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const items = await db.query("SELECT * FROM donation_hampers WHERE user_id = ?", [req.user.id]);
  res.json(items);
});

router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { name, quantity, source_type, emoji } = req.body;
  const result = await db.query(`
    INSERT INTO donation_hampers (user_id, name, quantity, source_type, emoji)
    VALUES (?, ?, ?, ?, ?)
  `, [req.user.id, name, quantity, source_type, emoji]) as any;
  res.json({ id: result.insertId, ...req.body });
});

router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await db.query("DELETE FROM donation_hampers WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  res.sendStatus(204);
});

export default router;
