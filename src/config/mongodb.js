import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env");
}

if (!dbName) {
  throw new Error("DB_NAME is missing from .env");
}

const client = new MongoClient(uri);

let database;
let connectionPromise;

export async function connectToDatabase() {
  if (database) {
    return database;
  }

  if (!connectionPromise) {
    connectionPromise = client
      .connect()
      .then((connectedClient) => {
        database = connectedClient.db(dbName);

        console.log(`MongoDB connected successfully: ${dbName}`);

        return database;
      })
      .catch((error) => {

        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}
