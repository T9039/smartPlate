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
  
  const expiringNames = expiringItems.map((i: any) => i.name.toLowerCase());
  
  try {
      // 1. Try to fetch from cache globally
      const allRecipes = await db.query(`SELECT * FROM recipes ORDER BY id DESC LIMIT 200`) as any[];
      let matchedRecipes: any[] = [];
      
      for (const row of allRecipes) {
          try {
              const ingredients = JSON.parse(row.ingredients);
              let matchCount = 0;
              for (const exp of expiringNames) {
                  if (ingredients.some((ing: any) => ing.name.toLowerCase().includes(exp))) {
                      matchCount++;
                  }
              }
              const matchPercent = expiringNames.length ? (matchCount / expiringNames.length) : 0;
              
              if (matchPercent >= 0.5) {
                  matchedRecipes.push({
                      id: row.id,
                      title: row.title,
                      icon: row.emoji,
                      time: row.time,
                      difficulty: row.difficulty,
                      matchPercent: Math.round(matchPercent * 100),
                      ingredients: ingredients,
                      steps: JSON.parse(row.steps)
                  });
              }
          } catch (err) {
              // Ignore malformed JSON in DB
          }
      }
      
      // If we found enough matched recipes, return them!
      if (matchedRecipes.length >= 3) {
          return res.json(matchedRecipes.slice(0, 3));
      }

      // 2. Otherwise, fall back to AI
      const aiRecipes = await getRecipeSuggestions(expiringItems.map((i: any) => i.name));
      
      // 3. Save newly generated recipes to cache
      const finalRecipes = [];
      for (const recipe of aiRecipes) {
          const insertRes = await db.query(`
              INSERT INTO recipes (user_id, title, time, difficulty, emoji, ingredients, steps)
              VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
              req.user.id,
              recipe.title,
              recipe.time,
              recipe.difficulty,
              recipe.icon,
              JSON.stringify(recipe.ingredients),
              JSON.stringify(recipe.steps)
          ]) as any;
          
          finalRecipes.push({
              ...recipe,
              id: insertRes.insertId // Replace the string ID with real DB ID
          });
      }
      
      res.json(finalRecipes);
  } catch (e) {
      console.error("AI Recipe error", e);
      res.status(500).json({ error: "Failed to generate recipes" });
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
