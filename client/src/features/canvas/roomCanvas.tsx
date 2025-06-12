"use client"

const WS_SERVER = "ws://localhost:8080"
import { useEffect, useRef, useState } from "react"
import { Canvas } from "./canvas";

//p3@gmail.com
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZTExZDI1NC04NmViLTQ4ZDEtOGUxZi0xMWRhNWY0ZTE4NGEiLCJpYXQiOjE3NDY4NjIxMDJ9.aGoIFPMZNEXemFZ-MLbAddUziERBtPZQ7kA7O5kO-tI

//p1@gmail.com
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YWE3ZGFhOC04MjY1LTRiMGUtYjZjYy0wMjZlMTE3OGZjNWYiLCJpYXQiOjE3NDY4NjIxNjJ9.s-89Ze1BU1vM0GMhwGRf3oxK1AZcnK7QAf60VSx3Fdc
export default function RoomCanvas({roomId} : {roomId :string}){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [socket , setSocket] = useState<WebSocket | null>(null);
    const [token , setToken] = useState<string | null>(null)
    console.log("called RoomCanvas" , Math.random())
    
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);
    useEffect(()=>{
        if (token) {
        console.log("Connecting with token:", token);
        connectWebSocket();
        }
    },[token])
    function connectWebSocket() {
         if (!token) {
            // console.error("WebSocket connection aborted: No token available");
            return;
        }

        const wsUrl = `${WS_SERVER}?token=${encodeURIComponent(token || "")}`;
        const ws = new WebSocket(wsUrl);

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