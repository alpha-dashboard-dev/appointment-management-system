import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import routes from "./routes/index";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
// helmet sets a collection of protective HTTP headers (CSP, X-Frame-Options, etc.)
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow cross-origin requests. Restrict ALLOWED_ORIGIN in production via .env.
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ─── Request logging ──────────────────────────────────────────────────────────
// "dev" format: METHOD /path STATUS response-time
app.use(morgan("dev"));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());                              // parse JSON bodies
app.use(express.urlencoded({ extended: true }));      // parse form-encoded bodies

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api", routes);

// ─── 404 handler (must come after all routes) ─────────────────────────────────
app.use(notFoundHandler);

// ─── Global error handler (must be last, receives next(err) calls) ────────────
app.use(errorHandler);

export default app;

