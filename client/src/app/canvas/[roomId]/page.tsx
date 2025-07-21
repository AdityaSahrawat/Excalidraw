
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Canvas from "@/canvas/canvas";
import { Button } from "@/components/ui/button";

export default function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const WS_SERVER = process.env.NEXT_PUBLIC_WsURL!;
  const router = useRouter();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionSent, setSubscriptionSent] = useState(false);

  const handleGoToRooms = () => {
    router.push("/rooms");
  };


  useEffect(() => {
    if (!roomId) {
      setConnectionError("No room ID provided");
      setIsLoading(false);
      return;
    }

    const ws = new WebSocket(WS_SERVER);

    ws.onopen = () => {
      console.log("✅ WebSocket Connected!");
      setSocket(ws);
      
      ws.send(JSON.stringify({
        type: "subscribe",
        roomId,
      }));
      setSubscriptionSent(true);
      console.log("📤 Subscription message sent, waiting for response...");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 Received message:", data);

        if (data.type === "unauthorized") {
          console.error("❌ Unauthorized access:", data.reason);
          setConnectionError(data.reason || "Unauthorized access to this room.");
          setIsAuthorized(false);
          setIsLoading(false);
          ws.close();
          return;
        }

        if (data.type === "subscribed") {
          console.log("✅ Successfully subscribed to room");
          setIsAuthorized(true);
          setIsLoading(false);
          setConnectionError(null); // Clear any previous errors
          return;
        }

        if (data.type === "error") {
          console.error("❌ Server error:", data.message);
          setConnectionError(data.message || "Server error occurred.");
          setIsAuthorized(false);
          setIsLoading(false);
          ws.close();
          return;
        }

      } catch (parseError) {
        console.error("❌ Failed to parse WebSocket message:", parseError);
        setConnectionError("Invalid response from server.");
        setIsLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
      setConnectionError("Failed to connect to the server. Please check your connection.");
      setIsLoading(false);
    };

    ws.onclose = (event) => {
      console.warn(`⚠️ WebSocket closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
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
  }, [roomId, connectionError, isAuthorized, subscriptionSent]);

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
          <Button 
            onClick={handleGoToRooms}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            Go to Rooms
          </Button>
        </div>
      </div>
    );
  }

  // Success state - render Canvas
  return (
    <div>
      <Canvas roomId={roomId!} socket={socket!} />
    </div>
  );
}