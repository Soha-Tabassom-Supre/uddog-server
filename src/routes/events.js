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


router.get("/featured", async (req, res) => {
  try {
    const db = await connectToDatabase();

    const events = await db
      .collection("events")
      .find({
        eventDate: { $gte: new Date() },
      })
      .sort({ eventDate: 1 })
      .limit(6)
      .toArray();

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Failed to fetch featured events:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch featured events.",
    });
  }
});

router.get("/my-events", async (req, res) => {
  try {
    const db = await connectToDatabase();

    const events = await db
      .collection("events")
      .find({
        creatorId: "temporary-test-user",
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Failed to fetch user's events:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your events.",
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

router.post("/", async (req, res) => {
  try {
    const { title, description, category, imageUrl, location, eventDate } =
      req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof imageUrl !== "string" ||
      !imageUrl.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      !eventDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All event fields are required.",
      });
    }

    try {
      const parsedImageUrl = new URL(imageUrl);

      if (
        parsedImageUrl.protocol !== "https:" &&
        parsedImageUrl.protocol !== "http:"
      ) {
        throw new Error("Invalid image URL protocol");
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid image URL.",
      });
    }

    const parsedEventDate = new Date(eventDate);

    if (Number.isNaN(parsedEventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid event date.",
      });
    }

    if (parsedEventDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future.",
      });
    }

    
    const db = await connectToDatabase();

    const newEvent = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      imageUrl: imageUrl.trim(),
      location: location.trim(),
      eventDate: parsedEventDate,
      creatorId: "temporary-test-user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("events").insertOne(newEvent);

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event: {
        ...newEvent,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Failed to create event:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create event.",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const { title, description, category, imageUrl, location, eventDate } =
      req.body;

    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title must be a non-empty string.",
        });
      }

      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description must be a non-empty string.",
        });
      }

      updates.description = description.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category must be a non-empty string.",
        });
      }

      updates.category = category.trim();
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== "string" || !imageUrl.trim()) {
        return res.status(400).json({
          success: false,
          message: "Image URL must be a non-empty string.",
        });
      }

      try {
        const parsedUrl = new URL(imageUrl);

        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
          throw new Error("Invalid URL protocol");
        }
      } catch {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid image URL.",
        });
      }

      updates.imageUrl = imageUrl.trim();
    }

    if (location !== undefined) {
      if (typeof location !== "string" || !location.trim()) {
        return res.status(400).json({
          success: false,
          message: "Location must be a non-empty string.",
        });
      }

      updates.location = location.trim();
    }

    if (eventDate !== undefined) {
      const parsedDate = new Date(eventDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid event date.",
        });
      }

      if (parsedDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Event date must be in the future.",
        });
      }

      updates.eventDate = parsedDate;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid field to update.",
      });
    }

    updates.updatedAt = new Date();

   
    const db = await connectToDatabase();

    const result = await db
      .collection("events")
      .updateOne({ _id: new ObjectId(id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const updatedEvent = await db.collection("events").findOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Failed to update event:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update event.",
    });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const db = await connectToDatabase();

    const result = await db.collection("events").deleteOne({
      _id: new ObjectId(id),
    });

  
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

   
    res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete event:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete event.",
    });
  }
});

export default router;
