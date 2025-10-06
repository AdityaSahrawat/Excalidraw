/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Canvas from "@/canvas/canvas";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionSent, setSubscriptionSent] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const ensuringRef = useRef(false);
  const attemptedConnectRef = useRef(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const readWsToken = useCallback((): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('ws_token='));
    if (!match) return null;
    return match.split('=')[1] || null;
  }, []);

  const ensureOAuthToken = useCallback(async (): Promise<boolean> => {
    if (ensuringRef.current) return false;
    // If session not authenticated, nothing to do here
    if (sessionStatus !== 'authenticated') return false;
    const email = typeof session?.user?.email === 'string' ? session.user.email : undefined;
    if (!email) return false;
    if (!backendUrl) return false;
    ensuringRef.current = true;
    try {
      const usernameGuess = email.split('@')[0] || 'user';
      const resp = await axios.post(`${backendUrl}/user/oauth`, { email, username: usernameGuess }, { withCredentials: true });
      const respToken: string | undefined = resp.data?.token;
      // Manual mirror if cookie race
      if (respToken && typeof document !== 'undefined') {
        const hasWs = document.cookie.split(';').some(c => c.trim().startsWith('ws_token='));
        if (!hasWs) {
          document.cookie = `ws_token=${respToken}; Path=/; SameSite=${process.env.NODE_ENV === 'production' ? 'None' : 'Lax'}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
        }
      }
      // Wait a short moment for Set-Cookie to flush (even if we set manually, to keep ordering)
      await new Promise(r => setTimeout(r, 120));
      const token = readWsToken();
      if (token) return true;
    } catch (e) {
      console.warn('[Canvas] ensureOAuthToken failed', e);
    } finally {
      ensuringRef.current = false;
    }
    return false;
  }, [backendUrl, readWsToken, session?.user?.email, sessionStatus]);

  useEffect(() => { setIsHydrated(true); }, []);

  useEffect(() => {
    if (!roomId || !isHydrated) return;
    if (attemptedConnectRef.current) return;
    /*
      NOTE: We intentionally exclude ensureOAuthToken, readWsToken, connectionError, socket etc.
      - ensureOAuthToken & readWsToken are stable (useCallback with stable deps)
      - connectionError / socket changes should not re-trigger initial connection attempt
      This effect runs once per mount / roomId change.
    */
    const attachWsHandlers = (socket: WebSocket) => {
      socket.onopen = () => {
        console.log("✅ WebSocket Connected!");
        setSocket(socket);
        socket.send(JSON.stringify({ type: "subscribe", roomId }));
        setSubscriptionSent(true);
      };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Received message:", data);
          if (data.type === "unauthorized") {
            setConnectionError(data.reason || "Unauthorized access.");
            setIsAuthorized(false);
            setIsLoading(false);
            socket.close();
          } else if (data.type === "subscribed") {
            setIsAuthorized(true);
            setIsLoading(false);
          } else if (data.type === "error") {
            setConnectionError(data.message || "Server error.");
            setIsAuthorized(false);
            setIsLoading(false);
            socket.close();
          }
        } catch (err) {
          console.error("❌ Failed to parse message:", err);
          setConnectionError("Invalid response from server.");
          setIsLoading(false);
        }
      };
      socket.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
        setConnectionError("Failed to connect to the server.");
        setIsLoading(false);
      };
      socket.onclose = (event) => {
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
    };
    const connect = (token: string | null, attemptLabel: string) => {
      const baseUrl = process.env.NEXT_PUBLIC_WsURL || (
        typeof window !== 'undefined' && window.location.protocol === 'https:'
          ? 'wss://ws-backend-app.fly.dev'
          : 'ws://localhost:8080'
      );
      const wsUrl = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
      console.log(`🔌 (${attemptLabel}) Connecting to WebSocket ->`, wsUrl, token ? '(with token)' : '(no token)');
      const ws = new WebSocket(wsUrl);
      attachWsHandlers(ws);
      return ws;
    };

    const attemptConnectionFlow = async () => {
      attemptedConnectRef.current = true;
      // 1. Try immediate token
      let token = readWsToken();
      if (token) {
        connect(token, 'initial');
        return;
      }
      await new Promise(r => setTimeout(r, 180));
      token = readWsToken();
      if (token) {
        connect(token, 'delayed');
        return;
      }
      const start = Date.now();
      while (sessionStatus === 'loading' && Date.now() - start < 1200) {
        await new Promise(r => setTimeout(r, 120));
        token = readWsToken();
        if (token) {
          connect(token, 'post-session-load');
          return;
        }
      }
      if (!token && sessionStatus === 'authenticated') {
        const ensured = await ensureOAuthToken();
        if (ensured) {
          token = readWsToken();
          if (token) {
            connect(token, 'after-ensure');
            return;
          }
        }
      }
      for (let i = 0; i < 4 && !token; i++) {
        await new Promise(r => setTimeout(r, 150));
        token = readWsToken();
        if (token) {
          connect(token, `final-poll-${i}`);
          return;
        }
      }
      setConnectionError('Authentication token missing. Please sign in again.');
      setIsLoading(false);
      attemptedConnectRef.current = false;
    };

    attemptConnectionFlow();

    return () => {
      const activeSocket = socket;
      if (activeSocket && (activeSocket.readyState === WebSocket.OPEN || activeSocket.readyState === WebSocket.CONNECTING)) {
        activeSocket.close();
      }
    };
  }, [roomId, isHydrated, sessionStatus]);

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
