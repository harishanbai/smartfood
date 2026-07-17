import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_lunch');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.warn("WARNING: Running in In-Memory Mock Database Mode. Changes will not persist across restarts.");
    process.env.USE_MOCK_DB = 'true';
  }
};

export default connectDB;
