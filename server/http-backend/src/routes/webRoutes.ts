import { Router } from "express";
import {joinRoom, roomSchema} from "@zod/index"

import {prismaClient} from "@db/index"
import { UserMiddleware } from "@http/middleware/userMiddleware";

const webRouter: Router = Router();

webRouter.post('/room', UserMiddleware , async(req, res) => {
    const parseData = roomSchema.safeParse(req.body);

    if(!parseData.success){
        res.json({
            message : "room did not exists"
        })
        return ;
    }
    const userId = req.userId

    try {
        const room = await prismaClient.room.create({
            data : {
                name : parseData.data.name,
                adminId  :userId?? '' ,
                code : parseData.data.code
            }
        })
        res.status(201).json({
            roomId : room.id , 
            roomCode : room.code
        })
    } catch (error) {
        res.status(500).json({
            message : "Internal server error" 
        })
    }
    
})

webRouter.get('/element/:roomId', UserMiddleware , async (req , res)=>{
    const roomId = req.params.roomId;
    try{
        const elements = await prismaClient.element.findMany({
            where:{
                roomId : roomId,
            }
        }) 
        res.json({
            elements
        })
    }catch(e){
        res.json({
            elements: []
        })
    }
})

webRouter.get('/rooms' , UserMiddleware , async(req , res)=>{
    const userId = req.userId
    console.log("userId : " , userId)


    const rooms = await prismaClient.room.findMany({
        where : {
            adminId : userId
        }
    })
    if(rooms){
        console.log(rooms)
    }
    const joinedRooms = await prismaClient.joinedRooms.findMany({
        where : {
            userId : userId
        }
    })

    
    res.status(200).json({
        rooms , joinedRooms
    })
})

webRouter.post('/join-room' , UserMiddleware , async(req , res)=>{
    const parseData = joinRoom.safeParse(req.body);
    const userId = req.userId

    if(!parseData.success){
        res.status(400).json({
            message : "Invalid id or name"
        })
        return;
    }
    try{
        const response = await prismaClient.room.findFirst({
            where : {
                id : parseData.data.roomId,
                code : parseData.data.code
            }
        })

        if(!response){
            res.status(400).json({
                message : "room not found"
            })
            return;
        }
    }catch(e){
        res.status(500).json({
            message : "error in finding room"
        })
    }

    try{
        await prismaClient.joinedRooms.create({
            data : {
                userId : userId?? '',
                roomId : parseData.data.roomId
            }
        })

        res.status(200).json({
            message : "joined room successfully "
        })

    }catch(e){
        res.status(500).json({
            message : "error in joining room"
        })
    }
    
})

webRouter.patch('/code/:roomId' , UserMiddleware , async(req , res)=>{
    
    const {newCode} = req.body;
    const roomId = req.params.roomId

    if(!roomId || !newCode || newCode.length != 6){
        res.status(400).json({
            message : "invalid id or code"
        })
    }

    try{
        await prismaClient.room.update({
            where : {
                id : roomId
            },data : {
                code : newCode
            }
        })

        res.status(200).json({
            message : "code updated successfully"
        })
    }catch(e){
        res.status(500).json({
            message : "error in updating the code"
        })
    }
})

webRouter.delete('/room/:roomId' , UserMiddleware  , async(req , res)=>{
    const roomId = req.params.roomId;
    const userId = req.body.userId
    if(!roomId){
        res.status(400).json({
            message : "roomId not found"
        })
    }

    try{
        const room = await prismaClient.room.findFirst({
            where : {
                adminId : userId,
                id : roomId
            }
        })
        
        if(!room){
            res.status(401).json({
                message : "room not found"
            })
            return;
        }
    }catch(e){
        res.status(400).json({
            message : "error in finding room"
        })
    }

    try{
        await prismaClient.$transaction([
            prismaClient.joinedRooms.deleteMany({
                where : {
                    roomId : roomId
                }
            }),
            prismaClient.room.delete({
                where : {
                    id : roomId
                }
            })
        ])

        res.status(200).json({
            message : "room deleted successfully"
        })
    }catch(e : any){
        if(e.code === "P2025"){
            res.status(404).json({
                message : "room not found"
            })
        }else {
            res.status(400).json({
                message : "error in deleting the room"
            })
        }
    }

})

export default webRouter;
