import { Request, Response } from "express";
import {
  createRoomService,
  joinRoomAsAudienceService,
} from "../room/room.service";

/* =========================
   CREATE ROOM
========================= */

export const createRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; 
    const { roomName } = req.body;

    const room = await createRoomService({
      userId,
      roomName
    });

    res.status(201).json({
      success: true,
      room
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   JOIN ROOM AS AUDIENCE
========================= */

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.body;

    const member = await joinRoomAsAudienceService({
      roomId,
      userId
    });

    res.status(200).json({
      success: true,
      member
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
