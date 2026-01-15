import mongoose from 'mongoose';

/**
 * Cached connection helper to avoid exhausting DB connections in serverless/hot-reload.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI. Set it in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
}

async function dbConnect() {
  if (cached?.conn) return cached.conn;

  if (!cached?.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default dbConnect;
