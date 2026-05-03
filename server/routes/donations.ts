import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";

const router = Router();

// Helper: map snake_case DB row → camelCase (matches inventory shape)
const toItem = (row: any) => ({
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
  inHamper:     !!row.in_hamper,
  flagged:      !!row.flagged,
  flagReason:   row.flag_reason,
  insights:     (() => { try { return row.insights ? JSON.parse(row.insights) : null; } catch { return null; } })(),
  sourceType:   'inventory',
  createdAt:    row.created_at,
});

// GET /donations — return all inventory items currently in this user's hamper
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const rows = await db.query(`
    SELECT inventory.*
    FROM inventory
    INNER JOIN hamper_items ON inventory.id = hamper_items.inventory_id
    WHERE hamper_items.user_id = ?
    ORDER BY hamper_items.added_at ASC
  `, [req.user.id]) as any[];
  res.json(rows.map(toItem));
});

// POST /donations — add an inventory item to the hamper by its inventory_id
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { inventory_id } = req.body;
  if (!inventory_id) return res.status(400).json({ error: 'inventory_id is required' });

  // Verify the item belongs to this user
  const item = await db.queryOne(
    "SELECT * FROM inventory WHERE id = ? AND user_id = ?",
    [inventory_id, req.user.id]
  ) as any;
  if (!item) return res.status(404).json({ error: 'Item not found' });

  // Add to hamper junction table
  await db.query(
    "INSERT OR IGNORE INTO hamper_items (user_id, inventory_id) VALUES (?, ?)",
    [req.user.id, inventory_id]
  );

  // Mark the inventory item as in_hamper
  await db.query(
    "UPDATE inventory SET in_hamper = 1 WHERE id = ? AND user_id = ?",
    [inventory_id, req.user.id]
  );

  res.json(toItem({ ...item, in_hamper: 1 }));
});

// DELETE /donations/:inventory_id — remove item from hamper (item stays in inventory)
router.delete("/:inventory_id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { inventory_id } = req.params;

  await db.query(
    "DELETE FROM hamper_items WHERE user_id = ? AND inventory_id = ?",
    [req.user.id, inventory_id]
  );

  // Clear the in_hamper flag so it shows back in inventory
  await db.query(
    "UPDATE inventory SET in_hamper = 0 WHERE id = ? AND user_id = ?",
    [inventory_id, req.user.id]
  );

  res.sendStatus(204);
});

export default router;
