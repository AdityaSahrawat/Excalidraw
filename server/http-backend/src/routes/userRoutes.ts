import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken"
const userRouter: Router = Router();
import {prismaClient} from "@db/index"
import { userSchema , signinSchema , roomSchema } from "@zod/index"
import { Env } from "../config/env";
const jwt_secret = Env.JWT_SECRET;
const BCRYPT_ROUNDS = Env.BCRYPT_ROUNDS;

userRouter.post("/signup", async(req: Request, res: Response) => {
    const {username , email , password } = req.body 
    if(!username || !email || !password){
        res.status(403).json({
            message : "send username , email , password"
        })
        return;
    }
    try {
        const userExists = await prismaClient.user.findFirst({
            where : {
                email : email
            }
        })

        if(userExists){ 
            res.status(403).json({
                message : "A user allready exists with this email"
            })
            return;
        }
        const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const user = await prismaClient.user.create({
            data: {
                email,
                password: hashed,
                username,
                provider : "manual",
            }
        });
        const token = jwt.sign({ email: user.email, userId: user.id },
                jwt_secret
            );
            
        res
        .cookie("token", token, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            secure: process.env.NODE_ENV === 'production' ? true : false
        })
        // Non-httpOnly mirror for WS query param usage (XSS exposure risk)
    // WARNING: ws_token is readable by JS (XSS risk). Keep lifespan same as main token for now; consider shortening later.
    .cookie("ws_token", token, {
            httpOnly: false,
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
            secure: process.env.NODE_ENV === 'production' ? true : false
        })
    .status(200)
    .json({ message: "verified and user created!", token });
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
                email: parseData.data.email,
                provider: "manual"
            }
        })
        if(!user || !user.password){
            res.status(403).json({ message : "not authorized" });
            return;
        }
        const isValid = await bcrypt.compare(parseData.data.password, user.password);
        if(!isValid){
            res.status(403).json({ message : "not authorized" });
            return;
        }
        const token = jwt.sign({email : user.email , userId :user.id },jwt_secret)


        // Set httpOnly cookie for security (used by backend/WebSocket)
        res.cookie("token" , token , {
            httpOnly : true,
            sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
            secure: process.env.NODE_ENV === 'production' ? true : false
        })
    // WARNING: non-httpOnly mirror for WebSocket URL usage.
    .cookie("ws_token" , token , {
            httpOnly : false,
            sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
            secure: process.env.NODE_ENV === 'production' ? true : false
        })
        // Set accessible cookie for client-side auth checks
        .cookie("auth_status" , "authenticated" , {
            httpOnly : false,
            sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
            secure: process.env.NODE_ENV === 'production' ? true : false
        }).status(200).json({
            message : "signed in successfully!!",
            token
        })
    }catch(e){
        res.status(401).json({
            error : e,
            message : "user Not found"
        })
    }
})

userRouter.post("/oauth", async(req: Request, res: Response) => {
  const { email, username } = req.body;
  if (!email) {
    res.status(400).json({ message: "Missing or invalid data" });
    return
  }

  try {
    const existingUser = await prismaClient.user.findUnique({ where: { email } });

    if(existingUser?.provider === "manual"){
        res.status(403).json({
            message : "A user allreday exists with this email ( manual way ) "
        })
        return
    }

    let user;

    if (existingUser) {
      user = existingUser;
    } else {
      user = await prismaClient.user.create({
        data: {
          email,
          username,
          password: null,
          provider: "google",
        },
      });
    }

    const token = jwt.sign({ email: user.email, userId: user.id }, jwt_secret);

    // Set httpOnly cookie for security (used by backend/WebSocket)
    res.cookie("token" , token , {
        httpOnly : true,
        sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
        secure: process.env.NODE_ENV === 'production' ? true : false
    })
    // WARNING: non-httpOnly mirror for WebSocket URL usage.
    .cookie("ws_token" , token , {
        httpOnly : false,
        sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
        secure: process.env.NODE_ENV === 'production' ? true : false
    })
    // Set accessible cookie for client-side auth checks
    .cookie("auth_status" , "authenticated" , {
        httpOnly : false,
        sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
        secure: process.env.NODE_ENV === 'production' ? true : false
        }).status(200).json({
            message: existingUser ? "User logged in" : "User registered",
            token
        });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error,
    });

  }
});

userRouter.post("/send-code" , async (req : Request , res : Response)=>{
    const {email} = req.body;

    if(!email){
        res.status(403).json({
            message : "no email given"
        })
        return ;
    }

    try {
        const user = await prismaClient.user.findFirst({
            where : {
                email : email
            }
        })
        if(user){
            res.status(403).json({
                message : "A user allready exists with this email"
            })
            return
        }
    } catch (error) {
        res.status(500).json({
            message : "internal server error", error
        })
        return;
    }
    
    const verEmail =await prismaClient.verificationEmail.findFirst({
        where : {
            email : email
        }
    })
    const code = generateCode();
    try {
        if(verEmail){
            await prismaClient.verificationEmail.update({
                where : {
                    id : verEmail.id
                },data : {
                    code : code,
                    expireAt : new Date(Date.now() + (1000 * 60 * 10))
                }
            })
        }else{
            await prismaClient.verificationEmail.create({
                data : {
                    email : email,
                    code : code,
                    expireAt : new Date(Date.now() + (1000 * 60 * 10)) // 10 min
                }
            })
        }
        
        // Check if email configuration is available
        if (!Env.EMAIL_SERVICE || !Env.EMAIL_USER || !Env.EMAIL_PASS) {
            console.log(`⚠️  Email not configured. Code for ${email}: ${code}`);
            res.status(200).json({
                message: "Code sent successfully (development mode)",
                code: process.env.NODE_ENV !== 'production' ? code : undefined
            });
            return;
        }

        // code to send code
        const transporter = nodemailer.createTransport({
            service: Env.EMAIL_SERVICE,
            auth: {
                user: Env.EMAIL_USER,
                pass: Env.EMAIL_PASS,
            },
        });

        async function sendMail() {
            const info = await transporter.sendMail({
                from: '"White Board" <v1codesender@gmail.com>',
                to: email,
                subject: 'verification code for your email',
                text: `Your code for signup is ${code} !! `,
            });
        }

        try {
            await sendMail();
            console.log(`✅ Email sent successfully to ${email}`);
        } catch (emailError) {
            console.error(`❌ Failed to send email to ${email}:`, emailError);
            // Still return success but log the email error  
            res.status(200).json({
                message: "Code generated successfully (email delivery failed)",
                code: process.env.NODE_ENV !== 'production' ? code : undefined
            });
            return;
        }

        res.status(200).json({
            message : "code sent successfully"
        })
    } catch (error) {
        console.error("❌ Error in send-code endpoint:", error);
        res.status(500).json({
            message : "Internal server error",
            error: process.env.NODE_ENV !== 'production' ? error : undefined
        })
    }
})

userRouter.post("/verify-code" , async (req : Request , res : Response)=>{
    const {email , code , password , username} = req.body

    if(!email || !code || !password || !username){
        res.status(404).json({
            message : "all fields required"
        })
        return
    }

    try {
        const verEmail =await prismaClient.verificationEmail.findFirst({
            where : {
                email : email
            }
        })

        if(!verEmail){
            res.status(404).json({
                message : "email not found"
            })
            return;
        }

        if(verEmail.code !== code){
            res.status(403).json({
                message : "code not matched"
            })
            return;
        }

        if(verEmail.expireAt < new Date()){
            res.status(403).json({
                message : "code expired!! , Retry to send code"
            })
            return;
        }

        const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const user = await prismaClient.user.create({
            data : {
                username ,
                email,
                password: hashed,
                provider : "manual"
            }
        })

        await prismaClient.verificationEmail.delete({
            where : {
                id : verEmail.id
            }
        })

        const token = jwt.sign({email : user.email , userId :user.id },jwt_secret)

        // Set httpOnly + mirror cookies
        res.cookie("token" , token , {
            httpOnly : true,
            sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
            secure: process.env.NODE_ENV === 'production' ? true : false
        })
        .cookie("ws_token" , token , {
            httpOnly : false,
            sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
            secure: process.env.NODE_ENV === 'production' ? true : false
        })
        .cookie("auth_status" , "authenticated" , {
            httpOnly : false,
            sameSite : process.env.NODE_ENV === 'production' ? "none" : "lax",
            secure: process.env.NODE_ENV === 'production' ? true : false
        }).status(200).json({
            message : "verified and user created!!",
            token
        })
    } catch (error) {
        res.status(500).json({
            message : "Internal server error " , error
        })
    }
})

userRouter.get('/logout' , async (req : Request , res : Response)=>{
    // Clear httpOnly token cookie
    res.clearCookie("token" , {
        httpOnly : true,
        sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' ? true : false
    })
    // Clear non-httpOnly mirror
    .clearCookie("ws_token" , {
        httpOnly : false,
        sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' ? true : false
    })
    // Clear accessible auth status cookie
    .clearCookie("auth_status" , {
        httpOnly : false,
        sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' ? true : false
    })

    res.status(200).json({
        message : "Logged out"
    })
})

userRouter.get('/auth/status' , async (req : Request , res : Response)=>{
    const token = req.cookies?.token
    if(!token){
        res.status(204).json({
            isAuth : false
        })
        return;
    }

    try{
        const decoded = jwt.verify(token , jwt_secret);
        res.status(200).json({
            isAuth : true
        })
        return
    }catch(e){
        res.status(204).json({
            isAuth : false
        })
        return;
    }
} )

export default userRouter;


function generateCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

