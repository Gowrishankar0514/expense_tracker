const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const sessionMiddleware = require("./middleware/session");
const transactionRoutes = require("./routes/transactionRoutes");
const validateOrigin = require("./middleware/validateOrigin");
const dashboardRoutes = require("./routes/dashboardRoutes");

require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = 5000;

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(sessionMiddleware);

app.use("/api/health", healthRoutes);
app.use("/api/auth", validateOrigin, authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);
app.use(notFound);

app.listen(PORT, () => {
  console.log(`SpendWise API running on https://localhost:${PORT}`);
});
