import { Request, Response } from "express";
import {
  createRoomService,
  deleteRoomService,
  getAllRoomsService,
  getRoomUserListService,
  joinRoomAsAudienceService,
  updateRoomService,
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



/* =========================
   GET ALL ROOMS
========================= */

export const getAllRoomList = async (req: Request, res: Response) => {
  try {
    const rooms = await getAllRoomsService();

    res.status(200).json({
      success: true,
      rooms
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


/* =========================
  ROOM user list
========================= */


export const getRoomUserList = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const users = await getRoomUserListService(roomId);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   UPDATE ROOM
========================= */

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const payload = req.body;

    const room = await updateRoomService(roomId, payload);

    res.status(200).json({
      success: true,
      room
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   DELETE ROOM
========================= */

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    await deleteRoomService(roomId);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully"
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

