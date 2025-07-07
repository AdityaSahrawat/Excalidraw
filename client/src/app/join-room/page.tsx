import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";

const JoinRoomPage = () => {
  const router = useRouter();
  const BackendURL = "http://localhost:3009";

  useEffect(() => {
    if (!router.isReady) return;

    const roomId = router.query.roomId as string;
    const code = router.query.code as string;

    if (!roomId || !code) {
      router.push("/rooms");
      return;
    }

    async function joinRoom() {
      try {
        await axios.post(
          `${BackendURL}/v1/web/join-room`,
          {
            roomId,
            code,
          },
          {
            withCredentials : true
          }
        );
        router.push(`/game/${roomId}`);
      } catch (error) {
        console.error("Join failed", error);
        router.push("/rooms");
      }
    }

    joinRoom();
  }, [router]);

  return <p>Joining room...</p>;
};

export default JoinRoomPage;
