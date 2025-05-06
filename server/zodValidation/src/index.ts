
import {z} from "zod"


export const userSchema = z.object({
    username : z.string().min(3).max(25),
    email : z.string().email(),
    password: z.string().min(3).max(30)
})

export const signinSchema = z.object({
    username : z.string().min(3).max(25),
    password : z.string().min(5).max(30)
})

export const roomSchema = z.object({
    name : z.string().min(3).max(25)
})