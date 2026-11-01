import { connectToDatabase } from "../config/mongodb.js";

const sampleEvents = [
  {
    seedId: "evt-101",
    title: "Mirpur 10 Winter Warmth & Blanket Distribution",
    description:
      "Collecting and handing out clean blankets, shawls, and thermal winter garments directly to street vendors, rickshaw pullers, and pavement dwellers near Mirpur 10 roundabout.",
    category: "Donation",
    imageUrl:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&auto=format&fit=crop&q=80",
    location: {
      area: "Mirpur 10 Circle",
      city: "Dhaka",
      address: "Mirpur 10 Foot-Overbridge Concourse",
    },
    eventDate: new Date("2026-11-12T09:30:00.000Z"),
    organizerName: "Farhana Rahman",
    participantCount: 64,
  },
  {
    seedId: "evt-102",
    title: "1,000 Native Sapling Reforestation Drive along Bhairab",
    description:
      "Youth volunteer drive to plant native mangrove, neem, and fruit saplings along the eroded riverbanks of the Bhairab River to fortify local embankment soil.",
    category: "Plantation",
    imageUrl:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&auto=format&fit=crop&q=80",
    location: {
      area: "Daratana Ghat",
      city: "Jashore",
      address: "Old Bhairab River Embankment Road",
    },
    eventDate: new Date("2026-11-15T08:00:00.000Z"),
    organizerName: "Tanvir Hasan",
    participantCount: 84,
  },
  {
    seedId: "evt-103",
    title: "Mohammadpur Canal Plastic Recovery & Desilting",
    description:
      "Community-led cleanup mobilization to extract non-biodegradable single-use plastics from drainage canals, reducing localized urban waterlogging and mosquito breeding.",
    category: "Cleanup",
    imageUrl:
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=900&auto=format&fit=crop&q=80",
    location: {
      area: "Mohammadpur",
      city: "Dhaka",
      address: "Ramchandrapur Khal Bridge",
    },
    eventDate: new Date("2026-11-19T07:30:00.000Z"),
    organizerName: "Rafiul Islam",
    participantCount: 49,
  },
  {
    seedId: "evt-104",
    title: "Community Literacy & Children's Open-Air Book Circle",
    description:
      "Establishing a permanent community street bookshelf and holding an afternoon reading circle with stationery kit distributions for local primary school children.",
    category: "Education",
    imageUrl:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&auto=format&fit=crop&q=80",
    location: {
      area: "Boyra",
      city: "Khulna",
      address: "Boyra Central Children's Park",
    },
    eventDate: new Date("2026-11-22T14:30:00.000Z"),
    organizerName: "Nusrat Jahan",
    participantCount: 38,
  },
  {
    seedId: "evt-105",
    title: "Emergency Voluntary Blood Grouping & Thalassemia Drive",
    description:
      "Free medical checkup camp providing preliminary blood grouping tests, vital screening, and voluntary donor card registration for emergency regional registries.",
    category: "Healthcare",
    imageUrl:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=900&auto=format&fit=crop&q=80",
    location: {
      area: "Agrabad",
      city: "Chattogram",
      address: "Community Welfare Center Hall",
    },
    eventDate: new Date("2026-11-26T10:00:00.000Z"),
    organizerName: "Dr. Kazi Mahin",
    participantCount: 52,
  },
  {
    seedId: "evt-106",
    title: "Urban Rooftop Pollinator Garden & Seedling Swap",
    description:
      "Hands-on workshop teaching rooftop composting and potting mix preparation. Participants receive free heirloom vegetable seed packets to plant on residential terraces.",
    category: "Plantation",
    imageUrl:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900&auto=format&fit=crop&q=80",
    location: {
      area: "Dhanmondi 8/A",
      city: "Dhaka",
      address: "Dhanmondi Lake Community Walkway",
    },
    eventDate: new Date("2026-11-29T15:00:00.000Z"),
    organizerName: "Ayesha Siddiqua",
    participantCount: 41,
  },
];

async function seedEvents() {
  try {
    const db = await connectToDatabase();
    const eventsCollection = db.collection("events");

    const now = new Date();

    for (const event of sampleEvents) {
      const { seedId, ...eventData } = event;

      await eventsCollection.updateOne(
        { seedId },
        {
          $setOnInsert: {
            ...eventData,
            seedId,
            creatorId: "seed-data",
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      );
    }

    console.log("Sample events seeded successfully!");
    console.log(`Processed ${sampleEvents.length} sample events.`);
  } catch (error) {
    console.error("Error seeding events:", error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

seedEvents();
