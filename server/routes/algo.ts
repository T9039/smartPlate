import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

router.get("/insights", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;

    // 1. Calculate items wasted vs consumed
    const logs = await db.query(
      "SELECT item_name, quantity, action, logged_at FROM waste_logs WHERE user_id = ?",
      [userId]
    ) as any[];

    // 2. Fetch current inventory to estimate prices
    const inventory = await db.query(
      "SELECT name, price FROM inventory WHERE user_id = ?",
      [userId]
    ) as any[];

    // Map prices
    const priceMap: Record<string, number> = {};
    inventory.forEach(i => {
      if (i.price) priceMap[i.name.toLowerCase()] = Number(i.price);
    });

    let totalMoneyWasted = 0;
    const consumedCounts: Record<string, number> = {};
    const wastedCounts: Record<string, number> = {};

    logs.forEach(log => {
      const name = log.item_name.toLowerCase();
      const qty = Number(log.quantity) || 1;
      
      if (log.action === 'consumed') {
        consumedCounts[name] = (consumedCounts[name] || 0) + qty;
      } else if (log.action === 'wasted') {
        wastedCounts[name] = (wastedCounts[name] || 0) + qty;
        const price = priceMap[name] || 20; // fallback estimated cost
        totalMoneyWasted += (price * qty);
      }
    });

    // Find most consumed and most wasted
    const mostConsumed = Object.keys(consumedCounts).sort((a, b) => consumedCounts[b] - consumedCounts[a]);
    const mostWasted = Object.keys(wastedCounts).sort((a, b) => wastedCounts[b] - wastedCounts[a]);

    const suggestions = [];

    // Algorithm rules
    if (totalMoneyWasted > 100) {
      suggestions.push(`You have lost estimated R${totalMoneyWasted.toFixed(2)} to food waste. Consider buying smaller portions.`);
    }

    if (mostWasted.length > 0) {
      suggestions.push(`You frequently waste ${mostWasted[0]}. Try buying this in smaller quantities or freezing it early!`);
    }

    if (mostConsumed.length > 0) {
      suggestions.push(`You successfully use up a lot of ${mostConsumed[0]}. This is a safe staple to buy in bulk to save money!`);
    }

    if (mostWasted.length > 1) {
      suggestions.push(`Watch out for ${mostWasted[1]} as it is your second most wasted item.`);
    }

    // Default positive reinforcement
    if (suggestions.length === 0) {
      suggestions.push("You are doing great! Keep tracking your food to unlock more insights.");
    }

    res.json({
      totalMoneyWasted,
      mostConsumed: mostConsumed.slice(0, 3),
      mostWasted: mostWasted.slice(0, 3),
      suggestions
    });

  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
