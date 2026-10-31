import { Router } from "express";
import { connectToDatabase } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

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

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const db = await connectToDatabase();

    const event = await db.collection("events").findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Failed to fetch event:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event.",
    });
  }
});

export default router;
