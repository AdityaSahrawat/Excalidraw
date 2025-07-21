"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoom = exports.roomSchema = exports.signinSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(25),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(3).max(30),
    provider: zod_1.z.string()
}).or(zod_1.z.object({
    username: zod_1.z.string().min(3).max(25),
    email: zod_1.z.string().email(),
    password: zod_1.z.null(),
    provider: zod_1.z.string()
}));
exports.signinSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(3).max(30)
});
exports.roomSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(25),
    code: zod_1.z.string().length(6)
});
exports.joinRoom = zod_1.z.object({
    roomId: zod_1.z.string(),
    code: zod_1.z.string().length(6)
});
