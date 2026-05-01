import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  // Compute some basic stats
  const wasteStats = await db.queryOne(`
    SELECT 
      SUM(CASE WHEN action = 'consumed' THEN quantity ELSE 0 END) as total_saved,
      SUM(CASE WHEN action = 'wasted' THEN quantity ELSE 0 END) as total_wasted
    FROM waste_logs 
    WHERE user_id = ?
  `, [req.user.id]) as any;

  const donations = await db.queryOne(`SELECT COUNT(*) as count FROM donation_hampers WHERE user_id = ?`, [req.user.id]) as any;
  
  res.json({
    itemsSaved: wasteStats.total_saved || 0,
    itemsWasted: wasteStats.total_wasted || 0,
    donationsMade: donations.count || 0
  });
});

export default router;
