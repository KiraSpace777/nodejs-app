// src/db/connectMongoDB.js
// ---------------------------------
import mongoose from 'mongoose';
import { Student } from '../models/student.js';

export const connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB connection established successfully');

    // гарантуємо, що індекси в БД відповідають схемі
    await Student.syncIndexes();
    console.log('Indexes synced successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

// ==========================================================
// import mongoose from 'mongoose';
// import { Student } from '../models/student.js';

// export const connectMongoDB = async () => {
//   try {
//     const mongoUrl = process.env.MONGO_URL;
//     await mongoose.connect(mongoUrl);
//     console.log('✅ MongoDB connection established successfully');
//   } catch (error) {
//     console.error('❌ Failed to connect to MongoDB:', error.message);
//     process.exit(1); // аварійне завершення програми
//   }
// };
