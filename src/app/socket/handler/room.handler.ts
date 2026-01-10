import { Server, Socket } from "socket.io";
import { generateAgoraToken } from "../../../helpers/generateAgoraToken";
import { RoomMember } from "../../modules/room/room.model";

/* =========================
   ROOM HANDLER
   Handles:
   - Join room
   - Leave room
   - Promote audience → guest
========================= */

const roomHandler = (io: Server, socket: Socket) => {

  // ===== Promote Audience → Guest =====
  socket.on("promote-to-guest", async ({ roomId, hostId, targetUserId }: { roomId: string; hostId: string; targetUserId: string }) => {
    try {
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

      io.to(targetUserId).emit("agora-token-update", {
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

};

export default roomHandler;
