import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().regex(/^\d+$/),
  PORT_client: z.string().regex(/^\d+$/).optional(),
  CLIENT_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(5, 'JWT_SECRET too short'),
  BCRYPT_ROUNDS: z.string().regex(/^\d+$/).optional(),
  EMAIL_SERVICE: z.string().optional(),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const Env = {
  PORT: Number(parsed.data.PORT),
  PORT_CLIENT: parsed.data.PORT_client ? Number(parsed.data.PORT_client) : undefined,
  CLIENT_URL: parsed.data.CLIENT_URL,
  JWT_SECRET: parsed.data.JWT_SECRET,
  BCRYPT_ROUNDS: parsed.data.BCRYPT_ROUNDS ? Number(parsed.data.BCRYPT_ROUNDS) : 10,
  EMAIL_SERVICE: parsed.data.EMAIL_SERVICE,
  EMAIL_USER: parsed.data.EMAIL_USER,
  EMAIL_PASS: parsed.data.EMAIL_PASS,
};
