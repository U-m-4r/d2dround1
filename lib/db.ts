import mongoose from 'mongoose'
import { MONGODB_URI } from '@/lib/env'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

// Cached connection for hot-reload in dev
let cached = (global as any).__mongoose

if (!cached) {
  cached = (global as any).__mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}
