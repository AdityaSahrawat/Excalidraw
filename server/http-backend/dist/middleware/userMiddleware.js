"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMiddleware = UserMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_Secret = process.env.JWT_SECRET || process.env.jwt_secret || ""; // fallback empty => will fail verify
function UserMiddleware(req, res, next) {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    console.log("token : ", token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwt_Secret);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
        });
        return;
    }
}
