import mongoose from "mongoose";

export async function connectDB(mongoUri: string) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to server/.env");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  return mongoose.connection;
}

