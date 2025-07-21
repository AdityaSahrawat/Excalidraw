
import {z} from "zod"


export const userSchema = z.object({
    username : z.string().min(3).max(25),
    email : z.string().email(),
    password: z.string().min(3).max(30),
    provider : z.string()
}).or(z.object({
    username : z.string().min(3).max(25),
    email : z.string().email(),
    password: z.null(),
    provider : z.string()
}))

export const signinSchema = z.object({
    email : z.string().email(),
    password : z.string().min(3).max(30)
})

export const roomSchema = z.object({
    name : z.string().min(3).max(25),
    code : z.string().length(6)
})

export const joinRoom = z.object({
    roomId : z.string(),
    code : z.string().length(6)
})