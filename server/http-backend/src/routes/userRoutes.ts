import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken"
const userRouter = Router();
import {prismaClient} from "@db/index"
import { userSchema , signinSchema , roomSchema } from "@zod/index"
const jwt_secret  = "123"
const saltRound = process.env.SALTROUNDS || 5


userRouter.post("/signup", async(req: Request, res: Response) => {
    const parseData = userSchema.safeParse(req.body);

    if (!parseData.success) {
        res.status(400).json({ message: "Incorrect inputs" });
    }
    const {username , email , password} = req.body 
    
    
    try {
        const user = await prismaClient.user.create({
            data: {
                email,
                password,
                username,
            }
        });
        console.log("user : ", user)
        const token = jwt.sign({ email: user.email, id: user.id },
             jwt_secret 
            );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
});

userRouter.post('/signin', async(req: Request, res : Response) => {
    const parseData = signinSchema.safeParse(req.body);
    if (!parseData.success){
        res.json({
            message : "Incorrect Inputs"
        })
        return 
    }

    try{
        const user = await prismaClient.user.findFirst({
            where:{
                email: parseData.data.username,
                password : parseData.data.password
            }
        })
        if(!user){
            res.status(403).json({
                message : "not authorized"
            })
        }
        const token = jwt.sign({
            userId : user?.id
        } , jwt_secret)
        res.json({
            token : token
        })
    }catch(e){
        res.status(401).json({
            message : "user Not found"
        })
    }
})

export default userRouter;
