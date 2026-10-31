import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./src/config/mongodb.js";
import router from "./src/routes/events.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/events", router);

app.get("/", (req, res) => {
  res.json({ message: "Express server is running!" });
});


app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});


app.get("/api/db-test", async (req, res) => {
  try {
    const db = await connectToDatabase();

    await db.command({ ping: 1 });

    res.status(200).json({
      status: "success",
      message: "MongoDB is working correctly!",
      database: db.databaseName,
    });
  } catch (error) {
    console.error("Database test failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});


async function startServer() {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
startServer();
