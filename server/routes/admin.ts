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
                i.id, 
                u.username as userName, 
                i.name, 
                i.category,
                i.added_date as addedDate, 
                i.emoji,
                CASE WHEN i.donated = 1 THEN 'donated' WHEN i.in_hamper = 1 THEN 'hamper' ELSE 'active' END as status,
                i.flagged, 
                i.flag_reason as flagReason
            FROM inventory i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.created_at DESC
        `);
        res.json(inventory);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Admin Flag Inventory
router.put("/inventory/:id/flag", async (req: Request, res: Response) => {
    try {
        const { flagged, flagReason } = req.body;
        await db.query(`UPDATE inventory SET flagged = ?, flag_reason = ? WHERE id = ?`, [flagged ? 1 : 0, flagReason || null, req.params.id]);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Admin Delete Inventory
router.delete("/inventory/:id", async (req: Request, res: Response) => {
    try {
        await db.query(`DELETE FROM inventory WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Admin stats (Full Analytics Payload)
router.get("/stats", async (req: Request, res: Response) => {
    try {
        const totalUsers = await db.queryOne(`SELECT COUNT(*) as count FROM users WHERE role != 'admin'`) as { count: number };
        const activeUsers = await db.queryOne(`SELECT COUNT(*) as count FROM users WHERE role != 'admin' AND status = 'active'`) as { count: number };
        const totalDonations = await db.queryOne(`SELECT COUNT(*) as count FROM hamper_items`) as { count: number };
        
        const foodSaved = await db.queryOne(`SELECT SUM(quantity) as qty, COUNT(*) as cnt FROM waste_logs WHERE action = 'consumed'`) as { qty: number, cnt: number };
        const foodWasted = await db.queryOne(`SELECT SUM(quantity) as qty FROM waste_logs WHERE action = 'wasted'`) as { qty: number };
        
        // Let's get top wasted category and top donated item
        const topWasted = await db.queryOne(`
            SELECT i.category, COUNT(*) as count 
            FROM waste_logs w
            JOIN inventory i ON w.item_name = i.name
            WHERE w.action = 'wasted'
            GROUP BY i.category ORDER BY count DESC LIMIT 1
        `) as { category: string } | undefined;

        const topDonated = await db.queryOne(`
            SELECT i.name, COUNT(*) as count 
            FROM hamper_items h
            JOIN inventory i ON h.inventory_id = i.id
            GROUP BY i.name ORDER BY count DESC LIMIT 1
        `) as { name: string } | undefined;

        // Mock weekly trend for now (last 4 weeks)
        const weeklyTrend = [
            { week: "Week 1", saved: 10, wasted: 2, donations: 3 },
            { week: "Week 2", saved: 15, wasted: 4, donations: 5 },
            { week: "Week 3", saved: 8, wasted: 1, donations: 2 },
            { week: "This Week", saved: Math.floor(foodSaved?.qty || 0), wasted: Math.floor(foodWasted?.qty || 0), donations: totalDonations.count }
        ];

        // Category breakdown
        const categories = await db.query(`
            SELECT category, 
                   SUM(CASE WHEN used_recently = 1 THEN quantity ELSE 0 END) as saved,
                   0 as wasted 
            FROM inventory 
            WHERE category IS NOT NULL
            GROUP BY category
        `) as any[];

        res.json({
            totalUsers: totalUsers.count,
            activeUsers: activeUsers.count,
            totalItemsTracked: await db.queryOne(`SELECT COUNT(*) as count FROM inventory`).then((r:any) => r.count),
            totalDonations: totalDonations.count,
            totalFoodSaved: Math.floor(foodSaved?.qty || 0),
            totalFoodWasted: Math.floor(foodWasted?.qty || 0),
            totalItemsSaved: foodSaved?.cnt || 0,
            moneySavedTotal: (foodSaved?.cnt || 0) * 20,
            topWastedCategory: topWasted?.category || '—',
            topDonatedItem: topDonated?.name || '—',
            weeklyTrend: weeklyTrend,
            categoryBreakdown: categories.length ? categories : [{ category: "Produce", saved: 0, wasted: 0 }],
            donationsByLocation: [
                { location: "Community Center", count: Math.ceil(totalDonations.count * 0.6) },
                { location: "Local Shelter", count: Math.floor(totalDonations.count * 0.4) }
            ]
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
