"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().regex(/^\d+$/),
    PORT_client: zod_1.z.string().regex(/^\d+$/).optional(),
    CLIENT_URL: zod_1.z.string().url().optional(),
    JWT_SECRET: zod_1.z.string().min(16, 'JWT_SECRET too short'),
    BCRYPT_ROUNDS: zod_1.z.string().regex(/^\d+$/).optional(),
    EMAIL_SERVICE: zod_1.z.string().optional(),
    EMAIL_USER: zod_1.z.string().email().optional(),
    EMAIL_PASS: zod_1.z.string().optional(),
    DATABASE_URL: zod_1.z.string().url(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.format());
    process.exit(1);
}
exports.Env = {
    PORT: Number(parsed.data.PORT),
    PORT_CLIENT: parsed.data.PORT_client ? Number(parsed.data.PORT_client) : undefined,
    CLIENT_URL: parsed.data.CLIENT_URL,
    JWT_SECRET: parsed.data.JWT_SECRET,
    BCRYPT_ROUNDS: parsed.data.BCRYPT_ROUNDS ? Number(parsed.data.BCRYPT_ROUNDS) : 10,
    EMAIL_SERVICE: parsed.data.EMAIL_SERVICE,
    EMAIL_USER: parsed.data.EMAIL_USER,
    EMAIL_PASS: parsed.data.EMAIL_PASS,
    DATABASE_URL: parsed.data.DATABASE_URL,
};
