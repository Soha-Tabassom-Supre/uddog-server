import { Router } from "express";
import { connectToDatabase } from "../config/mongodb.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectToDatabase();

    const events = await db
      .collection("events")
      .find({
        eventDate: { $gte: new Date() },
      })
      .sort({ eventDate: 1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events.",
    });
  }
});

export default router;

