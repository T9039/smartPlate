import { Router, Request, Response } from "express";
import db from "../lib/db.js";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// Middleware to check if user is admin
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: Function) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    next();
};

router.use(authenticateToken);
router.use(requireAdmin);

// Get all users with stats
router.get("/users", async (req: Request, res: Response) => {
    try {
        const users = await db.query(`
            SELECT 
                u.id, u.username as name, u.email, u.status, u.created_at as joinDate,
                (SELECT COUNT(*) FROM inventory WHERE user_id = u.id) as itemsAdded,
                (SELECT COUNT(*) FROM waste_logs WHERE user_id = u.id AND action = 'consumed') as itemsSaved,
                (SELECT COUNT(*) FROM hamper_items WHERE user_id = u.id) as donationsMade
            FROM users u
            WHERE u.role != 'admin'
            ORDER BY u.created_at DESC
        `);
        res.json(users);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Toggle suspend
router.put("/users/:id/suspend", async (req: Request, res: Response) => {
    try {
        const user: any = await db.queryOne(`SELECT status FROM users WHERE id = ?`, [req.params.id]);
        if (!user) return res.status(404).json({ error: "User not found" });
        const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
        await db.query(`UPDATE users SET status = ? WHERE id = ?`, [newStatus, req.params.id]);
        res.json({ success: true, status: newStatus });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Delete user
router.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        await db.query(`DELETE FROM users WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Get all inventory across platform
router.get("/inventory", async (req: Request, res: Response) => {
    try {
        const inventory = await db.query(`
            SELECT 
                i.id, u.username as owner, i.name as itemName, i.added_date as dateAdded, 
                CASE WHEN i.donated = 1 THEN 'donated' WHEN i.in_hamper = 1 THEN 'hamper' ELSE 'active' END as status,
                i.flagged, i.flag_reason as flagReason
            FROM inventory i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.created_at DESC
        `);
        res.json(inventory);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Admin stats
router.get("/stats", async (req: Request, res: Response) => {
    try {
        const totalUsers = await db.queryOne(`SELECT COUNT(*) as count FROM users WHERE role != 'admin'`) as { count: number };
        const totalItems = await db.queryOne(`SELECT COUNT(*) as count FROM inventory`) as { count: number };
        const totalDonations = await db.queryOne(`SELECT COUNT(*) as count FROM hamper_items`) as { count: number };
        res.json({
            totalUsers: totalUsers.count,
            totalItemsTracked: totalItems.count,
            totalDonations: totalDonations.count
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
