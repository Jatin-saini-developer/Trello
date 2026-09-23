import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}

// Drop the old global unique index on orgs.name — uniqueness is now
// enforced per-user in the route layer, not at the database level.
mongoose.connection.once('open', async () => {
  try {
    await mongoose.connection.collection('orgs').dropIndex('name_1');
    console.log('Dropped unique index on orgs.name');
  } catch (e) {
    // Index doesn't exist or was already dropped — safe to ignore.
  }
});

export default connectDB