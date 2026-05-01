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

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mount Routes
app.use("/api/auth", authRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/waste-logs", wasteLogsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/analytics", analyticsRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`smartPlate Server running on http://localhost:${PORT}`);
});
