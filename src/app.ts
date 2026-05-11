import express from "express";

import routes from "./routes/index";
const app = express();

app.use(express.json());


app.get("/", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
});

app.use("/api", routes);


export default app;

