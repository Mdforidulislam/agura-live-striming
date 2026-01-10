import mongoose from 'mongoose';

const GuestRequestSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

GuestRequestSchema.index({ roomId: 1, userId: 1 }, { unique: true });

export const GuestRequest = mongoose.model('GuestRequest', GuestRequestSchema);
