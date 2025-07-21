"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const webRoutes_1 = __importDefault(require("./routes/webRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT;
const PORT_client = process.env.PORT_client;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: `http://localhost:${PORT_client}`,
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use("/v1/user", userRoutes_1.default);
app.use("/v1/web", webRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
