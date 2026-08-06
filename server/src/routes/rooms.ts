import { Hono } from "hono";
import z from "zod";
import { sValidator } from "@hono/standard-validator";
import {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  serializeRoom,
} from "../services/rooms";
import { ValidationError } from "../utils/errors";

const createRoomSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  roomName: z.string(),
});

const getRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
});

const joinRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
  userName: z.string(),
});

const leaveRoomSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
});

const handleValidationError = (result: {
  success: boolean;
  error?: unknown;
}) => {
  if (!result.success) {
    let errorDetails = "Invalid request payload";
    if (result.error) {
      const errObj = result.error as
        | { issues?: Array<{ path?: unknown[]; message?: string }> }
        | Array<{ path?: unknown[]; message?: string }>;
      const issues = Array.isArray(errObj) ? errObj : errObj.issues;
      if (issues && issues.length > 0) {
        errorDetails = issues
          .map(
            (i) =>
              `${Array.isArray(i.path) ? i.path.join(".") : "value"}: ${i.message || "invalid"}`,
          )
          .join("; ");
      }
    }
    throw new ValidationError(`Validation Error: ${errorDetails}`);
  }
};

const router = new Hono()
  .post(
    "/",
    sValidator("json", createRoomSchema, handleValidationError),
    (c) => {
      const { userId, userName, roomName } = c.req.valid("json");

      const roomId = createRoom(roomName, userId, userName);

      return c.json({ roomId });
    },
  )
  .get("/", sValidator("query", getRoomSchema, handleValidationError), (c) => {
    const { roomId, userId } = c.req.valid("query");

    const room = getRoom(roomId, userId);

    return c.json({
      success: true,
      room: serializeRoom(room),
    });
  })
  .post(
    "/join",
    sValidator("json", joinRoomSchema, handleValidationError),
    (c) => {
      const { roomId, userId, userName } = c.req.valid("json");

      const room = joinRoom(roomId, userId, userName);

      return c.json({
        success: true,
        room: serializeRoom(room),
      });
    },
  )
  .post(
    "/leave",
    sValidator("json", leaveRoomSchema, handleValidationError),
    (c) => {
      const { roomId, userId } = c.req.valid("json");

      leaveRoom(roomId, userId);

      return c.json({ success: true });
    },
  );

export default router;
