import { Server, Socket } from "socket.io";
import { generateAgoraToken } from "../../../../helpers/generateAgoraToken";
import { Room, RoomMember } from "../../../modules/room/room.model";

/* =========================
   ROOM HANDLER
   Handles:
   - Join room
   - Leave room 
   - Promote audience → guest
   - message 
========================= */

const roomHandler = (io: Server, socket: Socket) => {
        console.log('call the custom server ::>');

  // ================================
  // GET ROOM USER LIST (SOCKET)
  // ================================
  socket.on("join-room", async ({ roomId }) => {
    try {

      if (!roomId) {
        return socket.emit("room-user-list-error", {
          message: "roomId is required"
        });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return socket.emit("room-user-list-error", {
          message: "Room not found"
        });
      }

      const members = await RoomMember.find({
        roomId,
        status: "JOINED"
      })
        .populate("userId", "name email avatar")
        .select("userId role status createdAt")
        .sort({ createdAt: 1 });

      socket.emit("room-user-list", {
        roomId,
        members
      });

    } catch (err: any) {
      console.error("Get room user list error:", err);

      socket.emit("room-user-list-error", {
        message: err.message || "Failed to fetch room users"
      });
    }
  });

  // ===== Promote Audience  Guest =====
  socket.on("promote-to-guest", async ({ roomId, hostId, targetUserId }: { roomId: string; hostId: string; targetUserId: string }) => {
    try {

      console.log(roomId, hostId, targetUserId,'checking user id =============>');
      const host = await RoomMember.findOne({
        roomId,
        userId: hostId,
        role: "HOST",
        status: "JOINED",
      });

      if (!host) {
        return socket.emit("error", { message: "Only host can invite" });
      }

      const member = await RoomMember.findOne({
        roomId,
        userId: targetUserId,
        status: "JOINED",
      });

      if (!member) {
        return socket.emit("error", { message: "User not in room" });
      }

      if (member.role === "GUEST") {
        return socket.emit("error", { message: "Already a guest" });
      }

      member.role = "GUEST";
      member.isMuted = false;
      await member.save();

      const agoraToken = generateAgoraToken({
        channelName: roomId,
        uid: Number(targetUserId), 
        role: "PUBLISHER",
      });

      socket.emit("agora-token-update", {
        token: agoraToken,
        role: "GUEST",
      });

      socket.to(roomId).emit("user-promoted", { userId: targetUserId });

    } catch (err: any) {
      console.error("Promote to guest error:", err);
      socket.emit("error", { message: err.message || "Promotion failed" });
    }
  });

  // ===== Leave Room =====
  socket.on("leave-room", async ({ roomId, userId }: { roomId: string; userId: string }) => {
    try {

      socket.leave(roomId);

      await RoomMember.updateOne({ roomId, userId }, { status: "LEFT" });

      socket.to(roomId).emit("user-left", { userId });
    } catch (err: any) {
      console.error("Leave room error:", err);
      socket.emit("error", { message: err.message || "Leave room failed" });
    }
  });
}


export default roomHandler;
