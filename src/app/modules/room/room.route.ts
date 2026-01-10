/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { Room } from './room.model';
import { generateAgoraToken } from '../../../helpers/generateAgoraToken';

const router = express.Router();

router.post('/', auth(USER_ROLES.USER), async (req, res) => {
  try {
    const hostId = req.user.id;
    const existingRoom = await Room.findOne({
      hostId,
      status: 'live',
    });

    if (existingRoom) {
      return res.status(400).json({
        message: 'You already have a live room',
      });
    }

    const room = await Room.create({
      hostId,
      guestIds: [],
      status: 'live',
    });

    return res.status(201).json({
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({
      message: 'Failed to create room',
    });
  }
});

router.post('/:roomId/token', auth(USER_ROLES.USER), async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (room.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Room is not live',
      });
    }

    let role: 'PUBLISHER' | 'SUBSCRIBER' = 'SUBSCRIBER';

    if (
      req.user.id === room.hostId.toString() ||
      room.guestIds.map(String).includes(req.user.id)
    ) {
      role = 'PUBLISHER';
    }

    const token = generateAgoraToken({
      channelName: room.id,
      uid: Number(req.user.id),
      role,
    });

    return res.status(200).json({
      success: true,
      token,
      role,
    });
  } catch (error) {
    console.error('Agora token error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate token',
    });
  }
});

export const RoomRoutes = router;
