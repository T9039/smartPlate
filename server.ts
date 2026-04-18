import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./src/lib/db.js";
import { getRecipeSuggestions, getBehavioralNudge } from "./src/lib/ai.js";

const JWT_SECRET = "smartplate_secret_key_123"; // In prod, use process.env.JWT_SECRET

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
      const result = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)").run(username, email, hash);
      const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, username, email } });
    } catch (e) {
      res.status(400).json({ error: "Username or email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // --- Inventory Routes ---
  app.get("/api/inventory", authenticateToken, (req: any, res) => {
    const items = db.prepare("SELECT * FROM inventory WHERE user_id = ? ORDER BY expiry_date ASC").all(req.user.id);
    res.json(items);
  });

  app.post("/api/inventory", authenticateToken, (req: any, res) => {
    const { name, category, quantity, unit, expiry_date, barcode } = req.body;
    const result = db.prepare(`
      INSERT INTO inventory (user_id, name, category, quantity, unit, expiry_date, barcode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, name, category, quantity, unit, expiry_date, barcode);
    res.json({ id: result.lastInsertRowid, ...req.body });
  });

  app.delete("/api/inventory/:id", authenticateToken, (req: any, res) => {
    db.prepare("DELETE FROM inventory WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
    res.sendStatus(204);
  });

  // --- Waste Log Routes ---
  app.post("/api/waste-logs", authenticateToken, (req: any, res) => {
    const { item_name, quantity, action } = req.body;
    db.prepare("INSERT INTO waste_logs (user_id, item_name, quantity, action) VALUES (?, ?, ?, ?)").run(req.user.id, item_name, quantity, action);
    res.sendStatus(201);
  });

  app.get("/api/waste-logs", authenticateToken, (req: any, res) => {
    const logs = db.prepare("SELECT * FROM waste_logs WHERE user_id = ? ORDER BY logged_at DESC").all(req.user.id);
    res.json(logs);
  });

  // --- AI Routes ---
  app.get("/api/ai/recipes", authenticateToken, async (req: any, res) => {
    const expiringItems = db.prepare(`
        SELECT name FROM inventory 
        WHERE user_id = ? 
        AND expiry_date <= date('now', '+3 days')
        LIMIT 5
    `).all(req.user.id) as any[];
    
    if (expiringItems.length === 0) {
        return res.json([]);
    }
    
    try {
        const recipes = await getRecipeSuggestions(expiringItems.map(i => i.name));
        res.json(recipes);
    } catch (e) {
        res.status(500).json({ error: "AI failed to generate recipes" });
    }
  });

  app.get("/api/ai/nudges", authenticateToken, async (req: any, res) => {
    const history = db.prepare("SELECT * FROM waste_logs WHERE user_id = ? LIMIT 20").all(req.user.id);
    try {
        const nudges = await getBehavioralNudge(history);
        res.json(nudges);
    } catch (e) {
        res.json(["Keep tracking your waste to get personalized insights!"]);
    }
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
