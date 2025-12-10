import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Milk from './milk.schema';
import milkData from './milk.json';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;

async function seedMilk() {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URI);
    await Milk.deleteMany({});
    await Milk.insertMany(milkData);
    await mongoose.disconnect();
  } catch (err) {
    process.exit(1);
  }
}

seedMilk();
