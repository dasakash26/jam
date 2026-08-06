import { NotFoundError } from "../utils/errors";

export interface User {
  id: string;
  name: string;
  timeOutId?: ReturnType<typeof setTimeout>;
}

export interface Music {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  thumbnailUrl: string;
}

export interface Room {
  id: string;
  name: string;
  users: Map<string, User>;
  queue: Music[];
  history: Music[];
  isPlaying: boolean;
}

const PING_INTERVAL = 5 * 1000;
const rooms = new Map<string, Room>();

export function createRoom(roomName: string, userId: string, userName: string) {
  const roomId = crypto.randomUUID();

  // setup room
  rooms.set(roomId, {
    id: roomId,
    name: roomName,
    users: new Map(),
    queue: [],
    history: [],
    isPlaying: false,
  });

  joinRoom(roomId, userId, userName);
  return roomId;
}

export function joinRoom(roomId: string, userId: string, userName: string): Room {
  const room = rooms.get(roomId);

  if (!room) {
    throw new NotFoundError(`Unable to join room "${roomId}". Room does not exist.`);
  }

  const existingUser = room.users.get(userId);
  if (existingUser?.timeOutId) {
    clearTimeout(existingUser.timeOutId);
  }

  room.users.set(userId, {
    id: userId,
    name: userName,
    timeOutId: setTimeout(() => {
      try {
        leaveRoom(roomId, userId);
      } catch {}
    }, PING_INTERVAL),
  });

  return room;
}

export function leaveRoom(roomId: string, userId: string): void {
  const room = rooms.get(roomId);
  const user = room?.users.get(userId);

  if (!room || !user) {
    throw new NotFoundError(`Unable to leave room "${roomId}". Room or user session not found.`);
  }

  if (user.timeOutId) {
    clearTimeout(user.timeOutId);
  }

  room.users.delete(userId);
}

export function getRoom(roomId: string, userId: string): Room {
  const room = rooms.get(roomId);
  const user = room?.users.get(userId);

  if (!room || !user) {
    throw new NotFoundError(`Room "${roomId}" was not found or session expired.`);
  }

  if (user.timeOutId) {
    clearTimeout(user.timeOutId);
  }

  user.timeOutId = setTimeout(() => {
    try {
      leaveRoom(roomId, userId);
    } catch {}
  }, PING_INTERVAL);

  return room;
}

export function serializeRoom(room: Room) {
  return {
    ...room,
    users: Array.from(room.users.values()),
  };
}
