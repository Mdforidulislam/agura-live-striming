/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

import {
  createRoom,
  joinRoom
} from "./room.controller";

const router = express.Router();

/* ============================
   CREATE ROOM (HOST)
   POST /rooms
============================ */

router.post(
  "/",
  auth(USER_ROLES.USER),
  createRoom
);

/* ============================
   JOIN ROOM AS AUDIENCE
   POST /rooms/:roomId/join
============================ */

router.post(
  "/:roomId/join",
  auth(USER_ROLES.USER),
  joinRoom
);


export const RoomRoutes = router;