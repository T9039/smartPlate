import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";
import { getRecipeSuggestions, getBehavioralNudge } from "../lib/ai.js";

const router = Router();

router.get("/recipes", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  // SQLite DATE formatting is different, we'll use a simpler approach
  const expiringItems = await db.query(`
      SELECT name FROM inventory 
      WHERE user_id = ? 
      AND expiry_date <= date('now', '+3 days')
      LIMIT 5
  `, [req.user.id]) as any[];
  
  if (expiringItems.length === 0) {
      return res.json([]);
  }
  
  try {
      const recipes = await getRecipeSuggestions(expiringItems.map((i: any) => i.name));
      res.json(recipes);
  } catch (e) {
      res.status(500).json({ error: "AI failed to generate recipes" });
  }
});

router.get("/nudges", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const history = await db.query("SELECT * FROM waste_logs WHERE user_id = ? LIMIT 20", [req.user.id]) as any[];
  try {
      const nudges = await getBehavioralNudge(history);
      res.json(nudges);
  } catch (e) {
      res.json(["Keep tracking your waste to get personalized insights!"]);
  }
});

export default router;
