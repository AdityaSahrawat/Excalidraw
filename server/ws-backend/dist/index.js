"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("@db/index");
const cookie_1 = require("cookie");
const jwt_Secret = "123";
// Start WebSocket server
const wss = new ws_1.WebSocketServer({ port: 8080 }, () => {
    console.log("WS Server running on port 8080");
});
const users = new Map();
function checkUser(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwt_Secret);
        return (decoded === null || decoded === void 0 ? void 0 : decoded.userId) || null;
    }
    catch (e) {
        return null;
    }
}
// Connection handler
wss.on('connection', (ws, request) => __awaiter(void 0, void 0, void 0, function* () {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
        ws.close(1000, "no cookieHeader found");
        return;
    }
    const cookies = (0, cookie_1.parse)(cookieHeader);
    const token = cookies.token;
    const userId = token ? checkUser(token) : null;
    if (!userId)
        return ws.close(1000, "userId not found");
    const user = { ws, rooms: new Set(), userId };
    users.set(ws, user);
    console.log(`User connected: ${userId}`);
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        let data;
        try {
            data = typeof message === 'string' ? JSON.parse(message) : JSON.parse(message.toString());
        }
        catch (e) {
            console.warn("Invalid JSON:", message);
            return;
        }
        const handler = messageHandlers[data.type];
        if (handler) {
            try {
                yield handler(data, user);
            }
            catch (err) {
                console.error(`Error handling ${data.type}:`, err);
            }
        }
    }));
    ws.on('close', () => {
        users.delete(ws);
        console.log(`User disconnected: ${userId}`);
    });
}));
// Message Handlers
const messageHandlers = {
    subscribe: (data, user) => __awaiter(void 0, void 0, void 0, function* () {
        const roomId = data.roomId;
        if (isNaN(roomId))
            return;
        const isAdmin = yield index_1.prismaClient.room.findFirst({
            where: { id: roomId, adminId: user.userId }
        });
        const isJoined = yield index_1.prismaClient.joinedRooms.findFirst({
            where: {
                roomId,
                userId: user.userId
            }
        });
        if (isAdmin || isJoined) {
            user.rooms.add(data.roomId);
            console.log(`User ${user.userId} subscribed to room ${data.roomId}`);
            user.ws.send(JSON.stringify({
                type: "subscribed",
                reason: "You are subscribed to this room"
            }));
        }
        else {
            console.warn(`Unauthorized subscribe attempt by ${user.userId} to room ${data.roomId}`);
            user.ws.send(JSON.stringify({
                type: "unauthorized",
                reason: "You are not part of this room"
            }));
        }
    }),
    unsubscribe: (data, user) => __awaiter(void 0, void 0, void 0, function* () {
        user.rooms.delete(data.roomId);
        console.log(`User ${user.userId} unsubscribed from room ${data.roomId}`);
    }),
    addShape: (data, user) => __awaiter(void 0, void 0, void 0, function* () {
        const { roomId, shape, shapeId } = data;
        if (!roomId || !shape || !shapeId)
            return;
        yield index_1.prismaClient.element.create({
            data: {
                roomId: roomId,
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
    }),
    moveShape: (data, user) => __awaiter(void 0, void 0, void 0, function* () {
        const { roomId, shape, shapeId } = data;
        broadcastToRoom(roomId, user.userId, {
            type: "moveShape",
            shape,
            roomId,
            shapeId
        });
    }),
    updateShape: (data, user) => __awaiter(void 0, void 0, void 0, function* () {
        const { roomId, shape, shapeId } = data;
        const element = yield index_1.prismaClient.element.findUnique({
            where: {
                roomId: roomId,
                shapeId
            }
        });
        if (!element) {
            return console.warn("Shape not found for update");
        }
        yield index_1.prismaClient.element.update({
            where: { roomId: roomId, shapeId },
            data: {
                shape: JSON.stringify(shape)
            }
        });
        console.log("shape updated ");
        broadcastToRoom(roomId, null, {
            type: "moveShape",
            roomId,
            shape,
            shapeId
        });
    }),
    deleteShape: (data, user) => __awaiter(void 0, void 0, void 0, function* () {
        const { roomId, shapeId } = data;
        try {
            yield index_1.prismaClient.element.delete({
                where: { roomId: roomId, shapeId }
            });
            console.log("shape deleted");
            broadcastToRoom(roomId, user.userId, {
                type: "deleteShape",
                shapeId
            });
        }
        catch (err) {
            console.error("Failed to delete shape", err);
        }
    })
};
// Broadcast utility
function broadcastToRoom(roomId, senderId, data) {
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
