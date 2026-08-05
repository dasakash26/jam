export interface User {
  id: string;
  name: string;
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
  hostId: string;
  users: Map<string, User>;
  queue: Music[];
  history: Music[];
  isPlaying: boolean;
}

const rooms = new Map<string, Room>();

export function createRoom(roomName: string, userId: string, userName: string) {
  const roomId = crypto.randomUUID();
  const creator: User = {
    id: userId,
    name: userName,
  };

  rooms.set(roomId, {
    id: roomId,
    name: roomName,
    hostId: userId,
    users: new Map([[userId, creator]]),
    queue: [],
    history: [],
    isPlaying: false,
  });

  return roomId;
}

export function joinRoom(roomId: string, userId: string, userName: string) {
  const room = rooms.get(roomId);

  if (!room) return false;

  room.users.set(userId, {
    id: userId,
    name: userName,
  });

  return true;
}

export function getRoom(roomId: string) {
  return rooms.get(roomId);
}

export function serializeRoom(room: Room) {
  return {
    ...room,
    users: Array.from(room.users.values()),
  };
}

