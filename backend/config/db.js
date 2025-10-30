import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log(`Attempting to connect to MongoDB...`);
    console.log(`URI: ${process.env.MONGODB_URI.substring(0, 50)}...`); // Hide password
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    process.exit(1);
  }
};