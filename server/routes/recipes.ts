import { Router, Response } from "express";
import db from "../lib/db.js";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";

const router = Router();

// Get all saved recipes for the user
router.get("/saved", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const savedRecipes = await db.query(`
            SELECT r.*, sr.saved_at
            FROM recipes r
            JOIN saved_recipes sr ON r.id = sr.recipe_id
            WHERE sr.user_id = ?
            ORDER BY sr.saved_at DESC
        `, [req.user.id]) as any[];

        // Map the DB format back to frontend format
        const formatted = savedRecipes.map(row => ({
            id: row.id,
            title: row.title,
            icon: row.emoji,
            time: row.time,
            difficulty: row.difficulty,
            ingredients: JSON.parse(row.ingredients || "[]"),
            steps: JSON.parse(row.steps || "[]"),
            matchPercent: 100 // Saved recipes are fully matched visually, or we could omit this
        }));

        res.json(formatted);
    } catch (e) {
        console.error("Failed to get saved recipes", e);
        res.status(500).json({ error: "Failed to get saved recipes" });
    }
});

// Save a recipe
router.post("/:id/save", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        await db.query(`
            INSERT INTO saved_recipes (user_id, recipe_id)
            VALUES (?, ?)
            ON CONFLICT(user_id, recipe_id) DO NOTHING
        `, [req.user.id, req.params.id]);
        
        res.json({ success: true });
    } catch (e) {
        console.error("Failed to save recipe", e);
        res.status(500).json({ error: "Failed to save recipe" });
    }
});

// Unsave a recipe
router.delete("/:id/save", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
        await db.query(`
            DELETE FROM saved_recipes
            WHERE user_id = ? AND recipe_id = ?
        `, [req.user.id, req.params.id]);
        
        res.json({ success: true });
    } catch (e) {
        console.error("Failed to unsave recipe", e);
        res.status(500).json({ error: "Failed to unsave recipe" });
    }
});

export default router;
