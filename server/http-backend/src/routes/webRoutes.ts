import { Router } from "express";
import {roomSchema} from "@zod/index"

import {prismaClient} from "@db/index"
import { UserMeddleware } from "@http/middleware/userMiddleware";

const webRouter = Router();

webRouter.post('/room', UserMeddleware , async(req, res) => {
    const parseData = roomSchema.safeParse(req.body);

    if(!parseData.success){
        res.json({
            message : "room did not exists"
        })
        return ;
    }
    const userId = req.userId

    const room = await prismaClient.room.create({
        data : {
            name : parseData.data?.name,
            adminId  :userId?? '' 
        }
    })
    res.status(200).json({
        roomId : room.id
    })
})

webRouter.get('/chats/:roomId' , async (req , res)=>{

    try{
        const roomId = Number(req.params.roomId);
        const chats = await prismaClient.chat.findMany({
            where:{
                roomId : roomId
            },orderBy:{
                id : "asc"
            },
            take:100
        }) 
        res.json({
            chats
        })
    }catch(e){
        console.log(e);
        res.json({
            messages: []
        })
    }

    
})

// webRouter.get('/room/:slug' , async (req , res)=>{
//     const slug = req.params.slug;
//     const room = await prismaClient.room.findFirst({
//         where: {
//             slug : slug
//         }
//     });

//     res.json({
//         room
//     })
// })

export default webRouter;
