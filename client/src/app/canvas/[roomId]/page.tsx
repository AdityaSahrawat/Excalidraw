"use client";

import { use } from "react";
import RoomCanvas from "@/components/roomCanvas";

export default function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);  // ✅ Unwrap params using use()

    return <RoomCanvas roomId={roomId} />;
}