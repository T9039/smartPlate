import "dotenv/config";
import express from "express";
import cors from "cors";

// Routers
import authRouter from "./routes/auth.js";
import inventoryRouter from "./routes/inventory.js";
import donationsRouter from "./routes/donations.js";
import wasteLogsRouter from "./routes/wasteLogs.js";
import notificationsRouter from "./routes/notifications.js";
import aiRouter from "./routes/ai.js";
import analyticsRouter from "./routes/analytics.js";
import recipesRouter from "./routes/recipes.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

// Request logger so you can see traffic in Render logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use("/api/auth", authRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/waste-logs", wasteLogsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/admin", adminRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`smartPlate Server running on http://localhost:${PORT}`);
});
