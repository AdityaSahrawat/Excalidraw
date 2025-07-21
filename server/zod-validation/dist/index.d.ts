import { z } from "zod";
export declare const userSchema: z.ZodUnion<[z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    provider: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    email: string;
    password: string;
    provider: string;
}, {
    username: string;
    email: string;
    password: string;
    provider: string;
}>, z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodNull;
    provider: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    email: string;
    password: null;
    provider: string;
}, {
    username: string;
    email: string;
    password: null;
    provider: string;
}>]>;
export declare const signinSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const roomSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
}, {
    code: string;
    name: string;
}>;
export declare const joinRoom: z.ZodObject<{
    roomId: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    roomId: string;
}, {
    code: string;
    roomId: string;
}>;
