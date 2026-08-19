import mongoose from 'mongoose';

const orgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Org = mongoose.model('Org', orgSchema);

export default Org