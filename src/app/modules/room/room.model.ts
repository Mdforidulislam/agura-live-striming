import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    guestIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      validate: {
        validator: function (v: string) {
          return v.length <= 3;
        },
        message: 'A room can have a maximum of 3 guests',
      },
      default: [],
    },

    status: {
      type: String,
      enum: ['live', 'ended'],
      default: 'live',
    },
  },
  {
    timestamps: true,
  },
);

export const Room = mongoose.model('Room', RoomSchema);
