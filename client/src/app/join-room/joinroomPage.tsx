// app/join-room/JoinRoomPage.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { useEffect } from "react";

const JoinRoomPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    const roomId = searchParams.get("roomId");
    const code = searchParams.get("code");

    if (!roomId || !code) {
      router.push("/rooms");
      return;
    }

    async function checkAuth() {
      const res = await axios.get(`${backendUrl}/user/auth/status`, {
        withCredentials: true,
      });
      return res.data.isAuth;
    }

    checkAuth();

    async function joinRoom() {
      try {
        await axios.post(
          `${backendUrl}/web/join-room`,
          { roomId, code },
          { withCredentials: true }
        );
        router.push(`/game/${roomId}`);
      } catch (err) {
        console.error("Join failed", err);
        router.push("/rooms");
      }
    }

    joinRoom();
  }, [searchParams, router]);

  return <p>Joining room...</p>;
};

export default JoinRoomPage;
