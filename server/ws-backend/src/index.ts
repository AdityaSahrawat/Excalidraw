import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import { prismaClient } from "@db/index";
import {parse} from "cookie"
const jwt_Secret = "123";

// Start WebSocket server
const wss = new WebSocketServer({ port: 8080 }, () => {
  console.log("WS Server running on port 8080");
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


// Connection handler
wss.on('connection', async (ws, request) => {

  const cookieHeader = request.headers.cookie

  if(!cookieHeader){
    ws.close(1000 , "no cookieHeader found");
    return;
  }

  const cookies = parse(cookieHeader)
  const token = cookies.token;
  const userId = token ? checkUser(token) : null;


  if (!userId) return ws.close(1000 , "userId not found");

  const user: User = { ws, rooms: new Set(), userId };
  users.set(ws, user);

  console.log(`User connected: ${userId}`);

  ws.on('message', async (message) => {
    let data: any;
    try {
      data = typeof message === 'string' ? JSON.parse(message) : JSON.parse(message.toString());
    } catch (e) {
      console.warn("Invalid JSON:", message);
      return;
    }

    const handler = messageHandlers[data.type];


    if (handler) {
      try {
        await handler(data, user);
      } catch (err) {
        console.error(`Error handling ${data.type}:`, err);
      }
    }
  });

  ws.on('close', () => {
    users.delete(ws);
    console.log(`User disconnected: ${userId}`);
  });
});

// Message Handlers
const messageHandlers: Record<string, (data: any, user: User) => Promise<void>> = {
  subscribe: async (data, user) => {
    const roomId = Number(data.roomId);
    if (isNaN(roomId)) return;

    const isAdmin = await prismaClient.room.findFirst({
      where: { id: roomId, adminId: user.userId }
    });

    const isJoined = await prismaClient.joinedRooms.findFirst({
      where: {
         roomId,
         userid : user.userId  
        }
    });

    if (isAdmin || isJoined) {
      user.rooms.add(data.roomId);
      console.log(`User ${user.userId} subscribed to room ${data.roomId}`);
    } else {
      console.warn(`Unauthorized subscribe attempt by ${user.userId} to room ${data.roomId}`);
      user.ws.send(JSON.stringify({
        type : "unauthorized",
        reason : "You are not part of this room"
      }))
    }
  },

  unsubscribe: async (data, user) => {
    user.rooms.delete(data.roomId);
    console.log(`User ${user.userId} unsubscribed from room ${data.roomId}`);
  },

  addShape: async (data, user) => {
    const { roomId, shape, shapeId } = data;
    if (!roomId || !shape || !shapeId) return;

    await prismaClient.element.create({
      data: {
        roomId: Number(roomId),
        userId: user.userId,
        shape,
        shapeId
      }
    });

    broadcastToRoom(roomId, user.userId, {
      type: "addShape",
      shape,
      roomId,
      shapeId
    });
  },

  moveShape: async (data, user) => {
    const { roomId, shape, shapeId } = data;
    broadcastToRoom(roomId, user.userId, {
      type: "moveShape",
      shape,
      roomId,
      shapeId
    });
  },

  updateShape: async (data, user) => {
    const { roomId, shape, shapeId } = data;

    const element = await prismaClient.element.findUnique({
      where: {
        roomId: Number(roomId),
        shapeId
      }
    });

    if (!element) {
      return console.warn("Shape not found for update");
    }

    await prismaClient.element.update({
      where: { roomId: Number(roomId), shapeId },
      data: { 
        shape : JSON.stringify(shape)
       }
    });
    console.log("shape updated ")
    broadcastToRoom(roomId, null, {
      type: "moveShape",
      roomId,
      shape,
      shapeId
    });
  },

  deleteShape: async (data, user) => {
    const { roomId, shapeId } = data;
    try {
      await prismaClient.element.delete({
        where: { roomId: Number(roomId), shapeId }
      });
      console.log("shape deleted")
      broadcastToRoom(roomId, user.userId, {
        type: "deleteShape",
        shapeId
      });
    } catch (err) {
      console.error("Failed to delete shape", err);
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

// Ping support
// setInterval(() => {
//   for (const [ws] of users.entries()) {
//     if (ws.readyState === WebSocket.OPEN) {
//       ws.ping();
//     }
//   }
// }, 30000);
