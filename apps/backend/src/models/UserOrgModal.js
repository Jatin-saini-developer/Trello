import mongoose from 'mongoose';

const userOrgSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Org',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  },
  {
    timestamps: true
  }
);

// prevent same user joining same org twice
userOrgSchema.index({ userId: 1, orgId: 1 }, { unique: true });

const UserOrg = mongoose.model('UserOrg', userOrgSchema);

module.exports = UserOrg;