import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@db/index"
import { parse } from 'path';
import { subscribe, unsubscribe } from 'diagnostics_channel';
const jwt_Secret = "123"

const wss = new WebSocketServer({ port: 8080 } , ()=>{console.log("running on port 8080")});

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, jwt_Secret);
    if (typeof decoded == "string") {
      return null;
    }
    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch(e) {
    return null;
  }
}


const messageHandlear : Record<string , (data : any , user : User)=>Promise<void>> = {
  subscribe : async(data , user)=>{
    if(!user.rooms.includes(data.roomId)){
      user.rooms.push(data.roomId)
    }
  },

  unsubscribe : async(data ,user)=>{
    user.rooms = user.rooms.filter(x => x != data.roomId)
  },

  addShape : async(data , user)=>{
    const {roomId , shape , shapeId} = data

    await prismaClient.element.create({
      data:{
        roomId : Number(roomId),
        userId : user.userId,
        shape,
        shapeId
      }
    })

    BroadcastToRoom(roomId , user.userId , {
      type : "addShape",
      shape , 
      roomId,
      shapeId
    })
  },

  moveShape : async(data , user)=>{
    const {roomId , shape , shapeId} = data
    BroadcastToRoom(roomId , user.userId , {
      type : "moveShape",
      shape , 
      roomId,
      shapeId
    })
  },

  shapeMoved : async(data , user)=>{
    const {roomId , shape , shapeId} = data

    const element = await prismaClient.element.findUnique({
      where : {
        roomId : Number(roomId),
        shapeId
      }
    })

    if(!element){
      return console.error("Shape not found");
    }

    await prismaClient.element.update({
      where : {roomId : Number(roomId), shapeId},
      data : {shape : shape}
    })

    BroadcastToRoom(roomId, null, {
      type: "moveShape",
      roomId,
      shape,
      shapeId
    });
  },

  deleteShape : async(data , user)=>{
    const {roomId , shape , shapeId} = data

    await prismaClient.element.delete({
      where : {roomId : Number(roomId) , shapeId}
    })

    BroadcastToRoom(roomId , user.userId , {
      type : "deleteShape" , 
      shapeId
    })

  }

}



wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    ws.close()
    return;
  }
  const { searchParams } = new URL(url, `ws://${request.headers.host}`);
    const token = searchParams.get('token');

    if (!token) {
      ws.close();
      return;
    }

  const userId = checkUser(token);
  if (userId == null) {
    ws.close()
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })
 
  ws.on('message', async function message(data) {
    let parsedData;
    
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }
    const handler = messageHandlear[parsedData.type];
    if (handler) {
      try {
        const user = users.find(x => x.ws === ws);
        if(!user){return;}
        await handler(parsedData, user);
      } catch (err) {
        console.error(`Error in handler for type ${parsedData.type}:`, err);
      }
    }

  });

});


function BroadcastToRoom(roomId :string , senderId : string | null, data : any ){
  users.forEach( (user)=>{
    if(user.rooms.includes(roomId) && user.userId != senderId){
      user.ws.send(JSON.stringify(data))
    }
  })
}
