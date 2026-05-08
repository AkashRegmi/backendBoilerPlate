import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import { MAX_RETRIES, RETRY_DELAY } from '../utils/constant';
import { env } from './env.config';

let retryCount = 0;

const connectWithRetry = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      autoIndex: false, // better for production
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB connected successfully');
    retryCount = 0;
  } catch (error) {
    retryCount += 1;
    console.error(`MongoDB connection failed (attempt ${retryCount})`, error);

    if (retryCount >= MAX_RETRIES) {
      console.error('Max MongoDB retry attempts reached. Exiting process.');
      process.exit(1);
    }

    console.log(`Retrying MongoDB connection in ${RETRY_DELAY / 1000}s...`);
    setTimeout(connectWithRetry, RETRY_DELAY);
  }
};

export const connectDB = async () => {
  await connectWithRetry();

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
    connectWithRetry();
  });

  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
  });
};
