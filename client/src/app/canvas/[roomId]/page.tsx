"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Canvas from "@/canvas/canvas";
 
export default function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const WS_SERVER = "ws://localhost:8080";
  const router = useRouter();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);


  useEffect(() => {

    const ws = new WebSocket(WS_SERVER);

    ws.onopen = () => {
      console.log("✅ WebSocket Connected!");
      setSocket(ws);
      ws.send(JSON.stringify({
        type: "subscribe",
        roomId,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "unauthorized") {
        alert("You are not allowed in this room.");
        router.push("/unauthorized");
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };

    ws.onclose = (event) => {
      console.warn(`⚠️ WebSocket closed. Reason: ${event.reason} (Code: ${event.code})`);
    };

    return () => {
      ws.close();
    };
  }, [token, roomId]);

  if (!socket) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
