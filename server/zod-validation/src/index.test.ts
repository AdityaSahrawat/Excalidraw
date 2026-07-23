import { describe, it, expect } from "vitest";
import { userSchema, signinSchema, roomSchema, joinRoom } from "./index";

describe("User Schema Validation", () => {
  it("should validate a valid user signup payload", () => {
    const payload = {
      username: "adityasahrawat",
      email: "aditya@example.com",
      password: "securepassword123",
      provider: "credentials",
    };
    const result = userSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("should validate an OAuth user with null password", () => {
    const payload = {
      username: "adityasahrawat",
      email: "aditya@example.com",
      password: null,
      provider: "google",
    };
    const result = userSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("should reject an invalid email", () => {
    const payload = {
      username: "aditya",
      email: "not-an-email",
      password: "pass",
      provider: "credentials",
    };
    const result = userSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("Signin Schema Validation", () => {
  it("should validate correct signin payload", () => {
    const payload = {
      email: "user@example.com",
      password: "password123",
    };
    const result = signinSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("should fail if password is too short (< 3 chars)", () => {
    const payload = {
      email: "user@example.com",
      password: "12",
    };
    const result = signinSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("Room Schema Validation", () => {
  it("should validate valid room creation payload", () => {
    const payload = {
      name: "Design Team",
      code: "123456",
    };
    const result = roomSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("should fail if room code is not exactly 6 characters", () => {
    const payload = {
      name: "Design Team",
      code: "12345",
    };
    const result = roomSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe("Join Room Schema Validation", () => {
  it("should validate correct join room payload", () => {
    const payload = {
      roomId: "cuid1234567890",
      code: "654321",
    };
    const result = joinRoom.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
