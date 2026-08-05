import { Hono } from "hono";
import z from "zod";
import { sValidator } from "@hono/standard-validator";
import {
  createRoom,
  getRoom,
  joinRoom,
  serializeRoom,
} from "../services/rooms";

const createRoomSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  roomName: z.string(),
});

const getRoomSchema = z.object({
  roomId: z.string(),
});

const joinRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  userName: z.string(),
});

const router = new Hono()
  .post("/", sValidator("json", createRoomSchema), (c) => {
    const { userId, userName, roomName } = c.req.valid("json");

    const roomId = createRoom(roomName, userId, userName);

    console.debug(getRoom(roomId));

    return c.json({ roomId });
  })
  .get("/", sValidator("query", getRoomSchema), (c) => {
    const { roomId } = c.req.valid("query");

    const room = getRoom(roomId);
    console.debug(room);

    if (!room) return c.json({ success: false }, 404);

    return c.json({
      success: true,
      room: serializeRoom(room),
    });
  })
  .post("/join", sValidator("json", joinRoomSchema), (c) => {
    const { roomId, userId, userName } = c.req.valid("json");

    if (joinRoom(roomId, userId, userName)) {
      const room = getRoom(roomId)!;
      return c.json({
        success: true,
        room: serializeRoom(room),
      });
    }

    return c.json({ success: false }, 404);
  });

export default router;
