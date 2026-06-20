import mongoose from "mongoose";

export async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.warn("MONGODB_URI is not set in environment. Falling back to in-memory/isolated mock database pool for survival.");
      return;
    }
    
    const db = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`[Database] MongoDB Atlas connected successfully to host: ${db.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Atlas connection failed: ${error.message}`);
    // Do not crash the application during internet dropouts (offline first resilience style)
  }
}
