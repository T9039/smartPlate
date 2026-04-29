import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./lib/db.js";
import { getRecipeSuggestions, getBehavioralNudge } from "./lib/ai.js";

const JWT_SECRET = process.env.JWT_SECRET || "smartplate_secret_key_123";

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
    const result = await db.query("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, hash]);
    const userId = result.insertId;
    const token = jwt.sign({ id: userId, username }, JWT_SECRET);
    res.json({ token, user: { id: userId, username, email } });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Username or email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.queryOne("SELECT * FROM users WHERE email = ?", [email]);
  if (user && await bcrypt.compare(password, user.password_hash)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// --- Inventory Routes ---
app.get("/api/inventory", authenticateToken, async (req: any, res) => {
  const items = await db.query("SELECT * FROM inventory WHERE user_id = ? ORDER BY expiry_date ASC", [req.user.id]);
  res.json(items);
});

app.post("/api/inventory", authenticateToken, async (req: any, res) => {
  const { name, category, quantity, unit, price, expiry_date, added_date, emoji } = req.body;
  const result = await db.query(`
    INSERT INTO inventory (user_id, name, category, quantity, unit, price, expiry_date, added_date, emoji)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [req.user.id, name, category, quantity, unit, price, expiry_date, added_date, emoji]);
  res.json({ id: result.insertId, ...req.body });
});

app.put("/api/inventory/:id", authenticateToken, async (req: any, res) => {
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

app.delete("/api/inventory/:id", authenticateToken, async (req: any, res) => {
  await db.query("DELETE FROM inventory WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  res.sendStatus(204);
});

// --- Donations Routes ---
app.get("/api/donations", authenticateToken, async (req: any, res) => {
  const items = await db.query("SELECT * FROM donation_hampers WHERE user_id = ?", [req.user.id]);
  res.json(items);
});

app.post("/api/donations", authenticateToken, async (req: any, res) => {
  const { name, quantity, source_type, emoji } = req.body;
  const result = await db.query(`
    INSERT INTO donation_hampers (user_id, name, quantity, source_type, emoji)
    VALUES (?, ?, ?, ?, ?)
  `, [req.user.id, name, quantity, source_type, emoji]);
  res.json({ id: result.insertId, ...req.body });
});

app.delete("/api/donations/:id", authenticateToken, async (req: any, res) => {
  await db.query("DELETE FROM donation_hampers WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  res.sendStatus(204);
});

// --- Waste Log Routes ---
app.post("/api/waste-logs", authenticateToken, async (req: any, res) => {
  const { item_name, quantity, action } = req.body;
  await db.query("INSERT INTO waste_logs (user_id, item_name, quantity, action) VALUES (?, ?, ?, ?)", [req.user.id, item_name, quantity, action]);
  res.sendStatus(201);
});

app.get("/api/waste-logs", authenticateToken, async (req: any, res) => {
  const logs = await db.query("SELECT * FROM waste_logs WHERE user_id = ? ORDER BY logged_at DESC", [req.user.id]);
  res.json(logs);
});

// --- Notifications Routes ---
app.get("/api/notifications", authenticateToken, async (req: any, res) => {
  const notifications = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  res.json(notifications);
});

// --- AI Routes ---
app.get("/api/ai/recipes", authenticateToken, async (req: any, res) => {
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
  
  try {
      const recipes = await getRecipeSuggestions(expiringItems.map((i: any) => i.name));
      res.json(recipes);
  } catch (e) {
      res.status(500).json({ error: "AI failed to generate recipes" });
  }
});

app.get("/api/ai/nudges", authenticateToken, async (req: any, res) => {
  const history = await db.query("SELECT * FROM waste_logs WHERE user_id = ? LIMIT 20", [req.user.id]) as any[];
  try {
      const nudges = await getBehavioralNudge(history);
      res.json(nudges);
  } catch (e) {
      res.json(["Keep tracking your waste to get personalized insights!"]);
  }
});

// --- Analytics / Impact ---
app.get("/api/analytics", authenticateToken, async (req: any, res) => {
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`smartPlate Server running on http://localhost:${PORT}`);
});
