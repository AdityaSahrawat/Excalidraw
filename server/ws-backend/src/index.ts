import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@db/index"
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

    if (!decoded || !decoded.id) {
      return null;
    }

    return decoded.id;
  } catch(e) {
    return null;
  }
}

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);
  console.log("userId"  , userId)
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
    if (parsedData.type === "subscribe") {
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "unsubscribe") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter(x => x !== parsedData.room);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId
        }
      });

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message,
            roomId
          }))
        }
      })
    }

  });

});