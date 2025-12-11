import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import { prismaClient } from "@db/index";
import {parse} from "cookie"

import dotenv from "dotenv";
dotenv.config();

const jwt_Secret = process.env.JWT_SECRET!;
const ws_port = process.env.WS_PORT!
const MAX_MESSAGE_BYTES = 64 * 1024; 
const wss = new WebSocketServer({ port : Number(ws_port)}, () => {
  console.log("WS Server running on port " + ws_port);
});
interface User {
  ws: WebSocket;
  rooms: Set<string>;
  userId: string;
}

const users = new Map<WebSocket, User>();

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, jwt_Secret) as { userId: string };
    return decoded?.userId || null;
  } catch (e) {
    return null;
  }
}


wss.on('connection', async (ws, request) => {
  let token: string | undefined;
  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    try {
      const cookies = parse(cookieHeader);
      token = cookies.token || cookies.ws_token;
    } catch {}
  }
  if (!token && request.url) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      token = url.searchParams.get('token') || undefined;
    } catch {}
  }
  if (!token) {
    ws.close(4401, 'missing token');
    return;
  }
  const userId = checkUser(token);
  if (!userId) {
    ws.close(4401, 'invalid token');
    return;
  }
  const user: User = { ws, rooms: new Set(), userId };
  users.set(ws, user);


  (ws as any).isAlive = true;
  ws.on('pong', () => { (ws as any).isAlive = true; });

  ws.on('message', async (message) => {
    if (typeof message !== 'string' && !Buffer.isBuffer(message)) return;
    const size = typeof message === 'string' ? Buffer.byteLength(message) : message.length;
    if (size > MAX_MESSAGE_BYTES) {
      console.warn('Payload too large');
      ws.send(JSON.stringify({ type: 'error', reason: 'Payload too large' }));
      return;
    }
    let data: any;
    try {
      data = typeof message === 'string' ? JSON.parse(message) : JSON.parse(message.toString());
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', reason: 'Invalid JSON' }));
      return;
    }
    if (!data || typeof data.type !== 'string') {
      ws.send(JSON.stringify({ type: 'error', reason: 'Missing type' }));
      return;
    }
    const handler = messageHandlers[data.type];
    if (!handler) {
      ws.send(JSON.stringify({ type: 'error', reason: 'Unknown message type' }));
      return;
    }
    try {
      await handler(data, user);
    } catch (err) {
      console.error(`Error handling ${data.type}:`, err);
      ws.send(JSON.stringify({ type: 'error', reason: 'Handler failure' }));
    }
  });

  ws.on('close', () => {
    users.delete(ws);
  });
});

function ensureSubscribed(user: User, roomId: string): boolean {
  if (!user.rooms.has(roomId)) {
    user.ws.send(JSON.stringify({ type: 'unauthorized', reason: 'Not subscribed to room' }));
    return false;
  }
  return true;
}

const messageHandlers: Record<string, (data: any, user: User) => Promise<void>> = {
  subscribe: async (data, user) => {
    const roomId = data.roomId;
    if (!roomId) return;

    try {
      const isAdmin = await prismaClient.room.findFirst({ where: { id: roomId, adminId: user.userId } });
      const isJoined = await prismaClient.joinedRooms.findFirst({ where: { roomId, userId: user.userId } });

      if (isAdmin || isJoined) {
        user.rooms.add(roomId);
        user.ws.send(JSON.stringify({ type: 'subscribed', reason: 'You are subscribed to this room' }));
      } else {
        user.ws.send(JSON.stringify({ type: 'unauthorized', reason: 'You are not part of this room' }));
      }
    } catch {
      user.ws.send(JSON.stringify({ type: 'unauthorized', reason: 'Internal server error' }));
    }


    
  },

  unsubscribe: async (data, user) => {
    user.rooms.delete(data.roomId);
  },

  addShape: async (data, user) => {
    const { roomId, shape, shapeId } = data;
    if (!roomId || !shape || !shapeId) return;
    if (!ensureSubscribed(user, roomId)) return;
    const serialized = typeof shape === 'string' ? shape : JSON.stringify(shape);
    await prismaClient.element.create({
      data: {
        roomId,
        userId: user.userId,
        shape: serialized,
        shapeId
      }
    });
    broadcastToRoom(roomId, user.userId, {
      type: "addShape",
      shape: serialized,
      roomId,
      shapeId
    });
  },

  moveShape: async (data, user) => {
    const { roomId, shape, shapeId } = data;
    if (!roomId || !shapeId) return;
    if (!ensureSubscribed(user, roomId)) return;
    broadcastToRoom(roomId, user.userId, {
      type: "moveShape",
      shape,
      roomId,
      shapeId
    });
  },

  updateShape: async (data, user) => {
    const { roomId, shape, shapeId } = data;
    if (!roomId || !shapeId) return;
    if (!ensureSubscribed(user, roomId)) return;
    const element = await prismaClient.element.findUnique({
      where: { roomId, shapeId }
    });
    if (!element) {
      user.ws.send(JSON.stringify({ type: 'error', reason: 'Shape not found' }));
      return;
    }
    const serialized = typeof shape === 'string' ? shape : JSON.stringify(shape);
    await prismaClient.element.update({
      where: { roomId, shapeId },
      data: { shape: serialized }
    });
    broadcastToRoom(roomId, null, {
      type: "moveShape",
      roomId,
      shape: serialized,
      shapeId
    });
  },

  deleteShape: async (data, user) => {
    const { roomId, shapeId } = data;
    if (!roomId || !shapeId) return;
    if (!ensureSubscribed(user, roomId)) return;
    try {
      await prismaClient.element.delete({
        where: { roomId, shapeId }
      });
      broadcastToRoom(roomId, user.userId, {
        type: "deleteShape",
        shapeId
      });
    } catch (err) {
      user.ws.send(JSON.stringify({ type: 'error', reason: 'Delete failed' }));
    }
  }
};
// Broadcast utility
function broadcastToRoom(roomId: string, senderId: string | null, data: any) {
  for (const [, user] of users.entries()) {
    if (user.rooms.has(roomId) && user.userId !== senderId) {
      user.ws.send(JSON.stringify(data));
    }
  }
}

// Heartbeat / keep-alive
setInterval(() => {
  for (const [ws] of users.entries()) {
    if ((ws as any).isAlive === false) {
      ws.terminate();
      continue;
    }
    (ws as any).isAlive = false;
    if (ws.readyState === WebSocket.OPEN) ws.ping();
  }
}, 30000);
