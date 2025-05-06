"use client"

const WS_SERVER = "ws://localhost:8080"
import { useEffect, useRef, useState } from "react"
import { Canvas } from "./canvas";

export default function RoomCanvas({roomId} : {roomId :string}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [socket , setSocket] = useState<WebSocket | null>(null);


    function connectWebSocket() {
        console.log("📡 Attempting to connect to WebSocket...");
        const ws = new WebSocket(`${WS_SERVER}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InAzQGdtYWlsLmNvbSIsImlkIjoiMGUxMWQyNTQtODZlYi00OGQxLThlMWYtMTFkYTVmNGUxODRhIiwiaWF0IjoxNzQ2MjU5NjEyfQ.emkBPudS2ui14mo2XV0CHMq9AmrzICyiJGv5u4dl1EE`);

        ws.onopen = () => {
            console.log("✅ WebSocket Connected!");
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "subscribe",
                roomId
            }));
        };

        ws.onerror = (error) => {
            console.error("❌ WebSocket Error:", error);
        };

        ws.onclose = (event) => {
            console.warn(`⚠️ WebSocket closed. Reason: ${event.reason} (Code: ${event.code})`);
            // setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
            
        };

        return ws;
    }

    useEffect( ()=>{ 
        if (!socket){
            connectWebSocket()
        };
        return () => {
            if (socket?.readyState === WebSocket.OPEN) {
                console.log("🔴 Closing WebSocket connection...");
                socket.close();
            }
        };
        

    }, [roomId])
    

    if(!socket){
        return (
            <div>
                loading...
            </div>
        )
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} />
        </div>
    )
}