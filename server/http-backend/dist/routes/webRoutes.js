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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("@zod/index");
const index_2 = require("@db/index");
const userMiddleware_1 = require("@http/middleware/userMiddleware");
const webRouter = (0, express_1.Router)();
webRouter.post('/room', userMiddleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parseData = index_1.roomSchema.safeParse(req.body);
    if (!parseData.success) {
        res.json({
            message: "room did not exists"
        });
        return;
    }
    const userId = req.userId;
    try {
        const room = yield index_2.prismaClient.room.create({
            data: {
                name: parseData.data.name,
                adminId: userId !== null && userId !== void 0 ? userId : '',
                code: parseData.data.code
            }
        });
        res.status(201).json({
            roomId: room.id,
            roomCode: room.code
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
webRouter.get('/element/:roomId', userMiddleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    try {
        const elements = yield index_2.prismaClient.element.findMany({
            where: {
                roomId: roomId,
            }
        });
        res.json({
            elements
        });
    }
    catch (e) {
        res.json({
            elements: []
        });
    }
}));
webRouter.get('/rooms', userMiddleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    console.log("userId : ", userId);
    const rooms = yield index_2.prismaClient.room.findMany({
        where: {
            adminId: userId
        }
    });
    if (rooms) {
        console.log(rooms);
    }
    const joinedRooms = yield index_2.prismaClient.joinedRooms.findMany({
        where: {
            userId: userId
        }
    });
    res.status(200).json({
        rooms, joinedRooms
    });
}));
webRouter.post('/join-room', userMiddleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parseData = index_1.joinRoom.safeParse(req.body);
    const userId = req.userId;
    if (!parseData.success) {
        res.status(400).json({
            message: "Invalid id or name"
        });
        return;
    }
    try {
        const response = yield index_2.prismaClient.room.findFirst({
            where: {
                id: parseData.data.roomId,
                code: parseData.data.code
            }
        });
        if (!response) {
            res.status(400).json({
                message: "room not found"
            });
            return;
        }
    }
    catch (e) {
        res.status(500).json({
            message: "error in finding room"
        });
    }
    try {
        yield index_2.prismaClient.joinedRooms.create({
            data: {
                userId: userId !== null && userId !== void 0 ? userId : '',
                roomId: parseData.data.roomId
            }
        });
        res.status(200).json({
            message: "joined room successfully "
        });
    }
    catch (e) {
        res.status(500).json({
            message: "error in joining room"
        });
    }
}));
webRouter.patch('/code/:roomId', userMiddleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newCode } = req.body;
    const roomId = req.params.roomId;
    if (!roomId || !newCode || newCode.length != 6) {
        res.status(400).json({
            message: "invalid id or code"
        });
    }
    try {
        yield index_2.prismaClient.room.update({
            where: {
                id: roomId
            }, data: {
                code: newCode
            }
        });
        res.status(200).json({
            message: "code updated successfully"
        });
    }
    catch (e) {
        res.status(500).json({
            message: "error in updating the code"
        });
    }
}));
webRouter.delete('/room/:roomId', userMiddleware_1.UserMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    const userId = req.body.userId;
    if (!roomId) {
        res.status(400).json({
            message: "roomId not found"
        });
    }
    try {
        const room = yield index_2.prismaClient.room.findFirst({
            where: {
                adminId: userId,
                id: roomId
            }
        });
        if (!room) {
            res.status(401).json({
                message: "room not found"
            });
            return;
        }
    }
    catch (e) {
        res.status(400).json({
            message: "error in finding room"
        });
    }
    try {
        yield index_2.prismaClient.$transaction([
            index_2.prismaClient.joinedRooms.deleteMany({
                where: {
                    roomId: roomId
                }
            }),
            index_2.prismaClient.room.delete({
                where: {
                    id: roomId
                }
            })
        ]);
        res.status(200).json({
            message: "room deleted successfully"
        });
    }
    catch (e) {
        if (e.code === "P2025") {
            res.status(404).json({
                message: "room not found"
            });
        }
        else {
            res.status(400).json({
                message: "error in deleting the room"
            });
        }
    }
}));
exports.default = webRouter;
