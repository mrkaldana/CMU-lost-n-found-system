import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./src/config/db";
import { authRouter } from "./src/routes/authRoutes";
import { itemsRouter } from "./src/routes/itemsRoutes";
import { adminRouter } from "./src/routes/adminRoutes";
import { errorHandler, notFound } from "./src/middleware/errorHandler";

dotenv.config();

const app = express();
const REQUEST_BODY_LIMIT = "8mb";

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedLanPorts = new Set(
  (process.env.CORS_LAN_PORTS || "8080,5173")
    .split(",")
    .map((port) => port.trim())
    .filter(Boolean)
);

function isPrivateIpv4(hostname: string) {
  const octets = hostname.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) {
    return false;
  }

  const [first, second] = octets;
  if (first === 10) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  return false;
}

function isAllowedLanOrigin(origin: string) {
  try {
    const parsed = new URL(origin);
    const { protocol, hostname, port } = parsed;
    const resolvedPort = port || (protocol === "https:" ? "443" : "80");
    if (!["http:", "https:"].includes(protocol)) return false;
    if (!allowedLanPorts.has(resolvedPort)) return false;
    return hostname === "localhost" || hostname === "127.0.0.1" || isPrivateIpv4(hostname);
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isAllowedLanOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);

async function start() {
  const port = Number(process.env.PORT || 5000);
  const host = process.env.HOST || "0.0.0.0";
  await connectDB(process.env.MONGO_URI || "");

  app.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://${host}:${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

