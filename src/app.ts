import express from "express";
import cors from "cors";
import routes from "./routes/index";
const app = express();

app.use(express.json());


app.use(cors({
    origin: process.env.FRONTEND_URL! || "http://localhost:5175",
    credentials: true,
}));
app.use(express.json());


app.get("/", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
});

app.use("/api", routes);


export default app;

