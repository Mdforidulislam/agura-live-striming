import mongoose from "mongoose";
import { Room, RoomMember } from "../room/room.model";
import { generateAgoraToken } from "../../../helpers/generateAgoraToken";

/* =========================
   1. CREATE ROOM (HOST)
========================= */

export const createRoomService = async ({
  userId,
  roomName
}: {
  userId: number;
  roomName: string;
}) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const roomUniqueId = `room_${Date.now()}`;

    const room = await Room.create(
      [
        {
          roomUniqueId,
          roomName,
          hostId: userId
        }
      ],
      { session }
    );

    await RoomMember.create(
      [
        {
          roomId: room[0]._id,
          userId,
          role: "HOST"
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();


    const agora = generateAgoraToken({
      channelName: roomUniqueId,
      uid: userId,
      role: "PUBLISHER"
    });

    return {
        room,
        agoraToken: agora
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/* =========================
   2. JOIN ROOM AS AUDIENCE
========================= */

export const joinRoomAsAudienceService = async ({
  roomId,
  userId
}: {
  roomId: string;
  userId: number;
}) => {

    console.log(roomId,userId,'checking userid and room id ============>');
  const room = await Room.findById(roomId);
  if (!room || room.status !== "ACTIVE") {
    throw new Error("Room not available");
  }

  const alreadyJoined = await RoomMember.findOne({
    roomId,
    userId,
    status: "JOINED"
  });

  if (alreadyJoined) return alreadyJoined;

  await RoomMember.create({
    roomId,
    userId,
    role: "AUDIENCE"
  });

  const agora = generateAgoraToken({
      channelName: room.roomUniqueId,
      uid: userId,
      role: "PUBLISHER"
    });

    return {
        room,
        agoraToken: agora
    };
};

/* =========================
   GET ALL ROOMS
========================= */

export const getAllRoomsService = async () => {
  return await Room.find()
    .populate("hostId", "name email image")
    .sort({ createdAt: -1 });
};

/* =========================
   UPDATE ROOM
========================= */

export const updateRoomService = async (
  roomId: string,
  payload: {
    roomName?: string;
    status?: "ACTIVE" | "ENDED" | "BLOCKED";
    settings?: {
      canInviteGuest?: boolean;
      audienceCanComment?: boolean;
    };
  }
) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  Object.assign(room, payload);
  await room.save();

  return room;
};


export const getRoomUserListService = async (roomId: string) => {
  const room = await Room.findById(roomId);
  if (!room) throw new Error("Room not found");

  const members = await RoomMember.find({
    roomId,
    status: "JOINED"
  })
    .populate("userId", "name email avatar")
    .select("userId role status createdAt")
    .sort({ createdAt: 1 });

  return members;
};


/* =========================
   DELETE ROOM
========================= */

export const deleteRoomService = async (roomId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const room = await Room.findById(roomId).session(session);
    if (!room) throw new Error("Room not found");

    await room.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
