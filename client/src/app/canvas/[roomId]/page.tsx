"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Canvas from "@/canvas/canvas";
import { Button } from "@/components/ui/button";

export default function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params); // unwraps promise
  const router = useRouter();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionSent, setSubscriptionSent] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false); 

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!roomId || !isHydrated) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WsURL!);

    ws.onopen = () => {
      console.log("✅ WebSocket Connected!");
      setSocket(ws);
      ws.send(JSON.stringify({ type: "subscribe", roomId }));
      setSubscriptionSent(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 Received message:", data);

        if (data.type === "unauthorized") {
          setConnectionError(data.reason || "Unauthorized access.");
          setIsAuthorized(false);
          setIsLoading(false);
          ws.close();
        } else if (data.type === "subscribed") {
          setIsAuthorized(true);
          setIsLoading(false);
        } else if (data.type === "error") {
          setConnectionError(data.message || "Server error.");
          setIsAuthorized(false);
          setIsLoading(false);
          ws.close();
        }
      } catch (err) {
        console.error("❌ Failed to parse message:", err);
        setConnectionError("Invalid response from server.");
        setIsLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
      setConnectionError("Failed to connect to the server.");
      setIsLoading(false);
    };

    ws.onclose = (event) => {
      console.warn(`⚠️ WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
      if (!connectionError && !isAuthorized) {
        if (subscriptionSent) {
          setConnectionError("Connection lost while waiting for room authorization.");
        } else {
          setConnectionError("Connection to server was lost.");
        }
        setIsLoading(false);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [roomId, isHydrated]);

  const handleGoToRooms = () => router.push("/rooms");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Connecting to room...</div>
          <div className="text-sm text-muted-foreground">
            {subscriptionSent ? "Waiting for authorization..." : "Establishing connection..."}
          </div>
        </div>
      </div>
    );
  }

  if (connectionError || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 font-semibold text-lg mb-4">
            Connection Error
          </div>
          <div className="text-gray-600 mb-6">
            {connectionError || "Access denied to this room."}
          </div>
          <Button onClick={handleGoToRooms}>Go to Rooms</Button>
        </div>
      </div>
    );
  }

  return <Canvas roomId={roomId} socket={socket!} />;
}
