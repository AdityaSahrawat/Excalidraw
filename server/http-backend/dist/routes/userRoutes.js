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
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRouter = (0, express_1.Router)();
const index_1 = require("@db/index");
const index_2 = require("@zod/index");
// const saltRound = process.env.saltRound
dotenv_1.default.config();
const jwt_secret = process.env.jwt_secret;
userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(403).json({
            message: "send username , email , password"
        });
        return;
    }
    try {
        const userExists = yield index_1.prismaClient.user.findFirst({
            where: {
                email: email
            }
        });
        if (userExists) {
            res.status(403).json({
                message: "A user allready exists with this email"
            });
            return;
        }
        const user = yield index_1.prismaClient.user.create({
            data: {
                email,
                password,
                username,
                provider: "manual",
            }
        });
        const token = jsonwebtoken_1.default.sign({ email: user.email, id: user.id }, jwt_secret);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        })
            .status(200)
            .json({ message: "verified and user created!" });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
}));
userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parseData = index_2.signinSchema.safeParse(req.body);
    if (!parseData.success) {
        res.json({
            message: "Incorrect Inputs"
        });
        return;
    }
    try {
        const user = yield index_1.prismaClient.user.findFirst({
            where: {
                email: parseData.data.email,
                password: parseData.data.password
            }
        });
        if (!user) {
            res.status(403).json({
                message: "not authorized"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, userId: user.id }, jwt_secret);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        }).status(200).json({
            message: "signed in successfully!!"
        });
    }
    catch (e) {
        res.status(401).json({
            message: "user Not found"
        });
    }
}));
userRouter.post("/oauth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username } = req.body;
    if (!email) {
        res.status(400).json({ message: "Missing or invalid data" });
        return;
    }
    try {
        const existingUser = yield index_1.prismaClient.user.findUnique({ where: { email } });
        if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.provider) === "manual") {
            res.status(403).json({
                message: "A user allreday exists with this email ( manual way ) "
            });
            return;
        }
        let user;
        if (existingUser) {
            user = existingUser;
        }
        else {
            user = yield index_1.prismaClient.user.create({
                data: {
                    email,
                    username,
                    password: null,
                    provider: "google",
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, userId: user.id }, jwt_secret);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        }).status(200).json({
            message: existingUser ? "User logged in" : "User registered",
            token
        });
        return;
    }
    catch (error) {
        console.error("OAuth error:", error);
        res.status(500).json({
            message: "Internal server error",
            error,
        });
    }
}));
userRouter.post("/send-code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(403).json({
            message: "no email given"
        });
        return;
    }
    try {
        const user = yield index_1.prismaClient.user.findFirst({
            where: {
                email: email
            }
        });
        if (user) {
            res.status(403).json({
                message: "A user allready exists with this email"
            });
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            message: "internal server error", error
        });
        return;
    }
    const verEmail = yield index_1.prismaClient.verificationEmail.findFirst({
        where: {
            email: email
        }
    });
    const code = generateCode();
    try {
        if (verEmail) {
            yield index_1.prismaClient.verificationEmail.update({
                where: {
                    id: verEmail.id
                }, data: {
                    code: code,
                    expireAt: new Date(Date.now() + (1000 * 60 * 10))
                }
            });
        }
        else {
            yield index_1.prismaClient.verificationEmail.create({
                data: {
                    email: email,
                    code: code,
                    expireAt: new Date(Date.now() + (1000 * 60 * 10)) // 10 min
                }
            });
        }
        // code to send code
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'v1codesender@gmail.com',
                pass: 'welc dhux joam nyjw',
            },
        });
        function sendMail() {
            return __awaiter(this, void 0, void 0, function* () {
                const info = yield transporter.sendMail({
                    from: '"White Board" <v1codesender@gmail.com>',
                    to: email,
                    subject: 'verification code for your email',
                    text: `Your code for signup is ${code} !! `,
                });
            });
        }
        yield sendMail();
        res.status(200).json({
            message: "code sent successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error ", error
        });
    }
}));
userRouter.post("/verify-code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code, password, username } = req.body;
    if (!email || !code || !password || !username) {
        res.status(404).json({
            message: "all fields required"
        });
        return;
    }
    try {
        const verEmail = yield index_1.prismaClient.verificationEmail.findFirst({
            where: {
                email: email
            }
        });
        if (!verEmail) {
            res.status(404).json({
                message: "email not found"
            });
            return;
        }
        if (verEmail.code !== code) {
            res.status(403).json({
                message: "code not matched"
            });
            return;
        }
        if (verEmail.expireAt < new Date()) {
            res.status(403).json({
                message: "code expired!! , Retry to send code"
            });
            return;
        }
        const user = yield index_1.prismaClient.user.create({
            data: {
                username,
                email,
                password,
                provider: "manual"
            }
        });
        yield index_1.prismaClient.verificationEmail.delete({
            where: {
                id: verEmail.id
            }
        });
        const token = jsonwebtoken_1.default.sign({ email: user.email, userId: user.id }, jwt_secret);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        }).status(200).json({
            message: "verified and user created!!",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error ", error
        });
    }
}));
userRouter.get('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });
    res.status(200).json({
        message: "Logged out"
    });
}));
userRouter.get('/auth/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if (!token) {
        res.status(204).json({
            isAuth: false
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwt_secret);
        res.status(200).json({
            isAuth: true
        });
        return;
    }
    catch (e) {
        res.status(204).json({
            isAuth: false
        });
        return;
    }
}));
exports.default = userRouter;
function generateCode() {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
}
