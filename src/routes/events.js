
import { Router } from "express";
import { connectToDatabase } from "../config/mongodb.js";
import { ObjectId } from "mongodb";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function isValidLocation(location) {
  return (
    location !== null &&
    typeof location === "object" &&
    !Array.isArray(location) &&
    typeof location.division === "string" &&
    location.division.trim().length > 0 &&
    typeof location.city === "string" &&
    location.city.trim().length > 0 &&
    typeof location.area === "string" &&
    location.area.trim().length > 0 &&
    typeof location.address === "string" &&
    location.address.trim().length > 0
  );
}
function normalizeLocation(location) {
  return {
    division: location.division.trim(),
    city: location.city.trim(),
    area: location.area.trim(),
    address: location.address.trim(),
  };
}

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

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);

    return res.status(500).json({
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

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Failed to fetch featured events:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch featured events.",
    });
  }
});

router.get("/my-events", requireAuth, async (req, res) => {
  try {
    const db = await connectToDatabase();

    const events = await db
      .collection("events")
      .find({
        creatorId: req.user.id,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Failed to fetch user's events:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your events.",
    });
  }
});

router.get("/joined", requireAuth, async (req, res) => {
  try {
    const db = await connectToDatabase();

    const registrations = await db
      .collection("eventRegistrations")
      .find({
        userId: req.user.id,
      })
      .sort({ registeredAt: -1 })
      .toArray();

    if (registrations.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        events: [],
      });
    }

    const eventIds = registrations.map(
      (registration) => registration.eventId
    );

    const events = await db
      .collection("events")
      .find({
        _id: { $in: eventIds },
      })
      .toArray();

    const eventMap = new Map(
      events.map((event) => [event._id.toString(), event])
    );

    const joinedEvents = registrations
      .map((registration) =>
        eventMap.get(registration.eventId.toString())
      )
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      count: joinedEvents.length,
      events: joinedEvents,
    });
  } catch (error) {
    console.error("Failed to fetch joined events:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch joined events.",
    });
  }
});

router.post("/:id/register", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const db = await connectToDatabase();
    const eventId = new ObjectId(id);

    const event = await db.collection("events").findOne({
      _id: eventId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (new Date(event.eventDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This event is no longer available for registration.",
      });
    }

    const registrations = db.collection("eventRegistrations");

    try {
      await registrations.insertOne({
        eventId,
        userId: req.user.id,
        registeredAt: new Date(),
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "You have already registered for this event.",
        });
      }

      throw error;
    }


    await db
      .collection("events")
      .updateOne({ _id: eventId }, { $inc: { participantCount: 1 } });

    const updatedEvent = await db
      .collection("events")
      .findOne({ _id: eventId }, { projection: { participantCount: 1 } });

    return res.status(201).json({
      success: true,
      message: "Successfully registered for the event.",
      participantCount: updatedEvent?.participantCount ?? 1,
    });
  } catch (error) {
    console.error("Failed to register for event:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register for the event.",
    });
  }
});

router.delete("/:id/register", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const db = await connectToDatabase();
    const eventId = new ObjectId(id);

    const result = await db.collection("eventRegistrations").deleteOne({
      eventId,
      userId: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "You are not registered for this event.",
      });
    }

    await db.collection("events").updateOne(
      {
        _id: eventId,
        participantCount: { $gt: 0 },
      },
      {
        $inc: { participantCount: -1 },
      },
    );

    const updatedEvent = await db
      .collection("events")
      .findOne({ _id: eventId }, { projection: { participantCount: 1 } });

    return res.status(200).json({
      success: true,
      message: "Registration cancelled successfully.",
      participantCount: updatedEvent?.participantCount ?? 0,
    });
  } catch (error) {
    console.error("Failed to cancel event registration:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel registration.",
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

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Failed to fetch event:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch event.",
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      imageUrl,
      location,
      eventDate,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof imageUrl !== "string" ||
      !imageUrl.trim() ||
      !isValidLocation(location) ||
      !eventDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required. Location must include division, district, area, and address.",
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
      location: normalizeLocation(location),
      eventDate: parsedEventDate,
      creatorId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("events").insertOne(newEvent);

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event: {
        ...newEvent,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Failed to create event:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create event.",
    });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const {
      title,
      description,
      category,
      imageUrl,
      location,
      eventDate,
    } = req.body;

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

        if (
          parsedUrl.protocol !== "https:" &&
          parsedUrl.protocol !== "http:"
        ) {
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
      if (!isValidLocation(location)) {
        return res.status(400).json({
          success: false,
          message:
            "Location must include non-empty division, district, area, and address fields.",
        });
      }

      updates.location = normalizeLocation(location);
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
    const collection = db.collection("events");

    const result = await collection.updateOne(
      {
        _id: new ObjectId(id),
        creatorId: req.user.id,
      },
      {
        $set: updates,
      }
    );

    if (result.matchedCount === 0) {
      const eventExists = await collection.findOne({
        _id: new ObjectId(id),
      });

      if (!eventExists) {
        return res.status(404).json({
          success: false,
          message: "Event not found.",
        });
      }

      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this event.",
      });
    }

    const updatedEvent = await collection.findOne({
      _id: new ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Failed to update event:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update event.",
    });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID.",
      });
    }

    const db = await connectToDatabase();
    const collection = db.collection("events");

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      creatorId: req.user.id,
    });

    if (result.deletedCount === 0) {
      const eventExists = await collection.findOne({
        _id: new ObjectId(id),
      });

      
      if (!eventExists) {
        return res.status(404).json({
          success: false,
          message: "Event not found.",
        });
      }

      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this event.",
      });
    }

    
    await db.collection("eventRegistrations").deleteMany({
      eventId: new ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete event:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete event.",
    });
  }
});

export default router;

