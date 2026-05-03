import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";
import { getFoodPreservationTips } from "../lib/ai.js";

const router = Router();

// Helper: map snake_case DB row to camelCase for the frontend
const toInventoryItem = (row: any) => ({
  id:           row.id,
  userId:       row.user_id,
  name:         row.name,
  category:     row.category,
  quantity:     row.quantity,
  unit:         row.unit,
  price:        row.price,
  expiryDate:   row.expiry_date,
  addedDate:    row.added_date,
  barcode:      row.barcode,
  emoji:        row.emoji,
  usedRecently: !!row.used_recently,
  expiringSoon: !!row.expiring_soon,
  donated:      !!row.donated,
  flagged:      !!row.flagged,
  flagReason:   row.flag_reason,
  insights:     (() => { try { return row.insights ? JSON.parse(row.insights) : null; } catch(e) { return null; } })(),
  createdAt:    row.created_at,
});

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const items = await db.query("SELECT * FROM inventory WHERE user_id = ? AND in_hamper = 0 ORDER BY expiry_date ASC", [req.user.id]) as any[];
  res.json(items.map(toInventoryItem));
});

router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { name, category, quantity, unit, price, expiry_date, added_date, emoji } = req.body;
  const result = await db.query(`
    INSERT INTO inventory (user_id, name, category, quantity, unit, price, expiry_date, added_date, emoji)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [req.user.id, name, category, quantity, unit, price, expiry_date, added_date, emoji]) as any;
  res.json(toInventoryItem({
    id: result.insertId,
    user_id: req.user.id,
    name, category, quantity, unit, price,
    expiry_date, added_date, emoji,
    used_recently: 0, expiring_soon: 0, donated: 0, flagged: 0,
    flag_reason: null, barcode: null, created_at: new Date().toISOString(),
  }));
});

router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { used_recently, expiring_soon, donated } = req.body;
  
  const updates = [];
  const params = [];
  
  if (used_recently !== undefined) {
    updates.push("used_recently = ?");
    params.push(used_recently ? 1 : 0);
  }
  if (expiring_soon !== undefined) {
    updates.push("expiring_soon = ?");
    params.push(expiring_soon ? 1 : 0);
  }
  if (donated !== undefined) {
    updates.push("donated = ?");
    params.push(donated ? 1 : 0);
  }
  
  if (updates.length > 0) {
    params.push(req.params.id, req.user.id);
    await db.query(`UPDATE inventory SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`, params);
  }
  
  res.sendStatus(200);
});

router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  await db.query("DELETE FROM inventory WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  res.sendStatus(204);
});

router.get("/:id/insights", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await db.query("SELECT * FROM inventory WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]) as any[];
    if (items.length === 0) return res.status(404).json({ error: "Item not found" });
    
    const item = items[0];
    
    // Return cached insights if they exist
    if (item.insights) {
      return res.json(JSON.parse(item.insights));
    }
    
    // Otherwise, fetch from AI
    const insights = await getFoodPreservationTips(item.name);
    
    // Cache it in the database
    await db.query("UPDATE inventory SET insights = ? WHERE id = ?", [JSON.stringify(insights), item.id]);
    
    res.json(insights);
  } catch (error: any) {
    const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuotaError) {
      console.warn("AI quota exhausted — returning fallback for insights");
      return res.status(503).json({ 
        error: "AI quota exceeded",
        tips: ["AI insights are temporarily unavailable. Please try again tomorrow when the daily quota resets."],
        preservation: null,
        quotaExceeded: true,
      });
    }
    console.warn("Failed to fetch insights:", error?.message);
    res.status(500).json({ error: "Failed to fetch storage tips" });
  }
});

export default router;
