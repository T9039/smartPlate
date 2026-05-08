import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

// Get all notifications for current user
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await db.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", 
      [req.user.id]
    ) as any[];
    
    // Convert snake_case to camelCase
    const formatted = notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: !!n.is_read,
      createdAt: n.created_at
    }));
    
    res.json(formatted);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Create new notification
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message, type = 'info' } = req.body;
    const result = await db.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
      [req.user.id, title, message, type]
    ) as any;
    
    res.json({
      id: result.insertId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Mark a notification as read
router.put("/:id/read", async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Delete a notification
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.query(
      "DELETE FROM notifications WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
