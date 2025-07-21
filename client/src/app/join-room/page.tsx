// app/join-room/page.tsx
import { Suspense } from "react";
import JoinRoomPage from "./joinroomPage";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <JoinRoomPage />
    </Suspense>
  );
}
