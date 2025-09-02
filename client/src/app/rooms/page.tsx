"use client"

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoomSkeleton from "./roomSkeleton";
import RoomCard from "./roomCard";
import CreateRoomDialog from "./createRoomDialog";
import RoomActions from "./roomAction";
import {DoorClosed, Loader2 ,ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type Room = {
  id: number;
  name: string;
  createdAt: string;
  code: string; 
};


const Index = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [roomCreated , setroomCreated] = useState<boolean>(false)
  const BackendURL  = process.env.NEXT_PUBLIC_BACKEND_URL

  function fetchRooms() {
    setLoading(true);
    setError(null);
    axios.get(`${BackendURL}/web/rooms`, {
        withCredentials : true
      })
      .then((response) => {
        setRooms(response.data.rooms || []);
      })
      .catch(() => {
        setError("Failed to load rooms.");
        setRooms([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(()=>{
    fetchRooms();
  } , [roomCreated])

  function handleRoomCodeChanged(roomId: number, newCode: string) {
    setRooms(prevRooms =>
      prevRooms.map(r => r.id === roomId ? { ...r, code: newCode } : r)
    );
  }

  function handleRoomDeleted(roomId: number) {
    setRooms(prevRooms => prevRooms.filter(r => r.id !== roomId));
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-start py-12 px-6 font-sans">
      <div className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
        <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <button onClick={()=>router.push('/')} className="px-4 py-2 text-black rounded-xl flex justify-center items-center hover:bg-gray-300 transition-colors duration-200 shadow-md hover:cursor-pointer">
              <ArrowLeft className="w-5 h-5"/>
            </button>

            <h1 className="text-4xl font-bold tracking-tight mb-1 flex items-center gap-3">
              <DoorClosed className="h-8 w-8 text-blue-600" />
              Your Rooms
            </h1>
            <p className="text-lg text-gray-600">
              View and manage your rooms. Share, copy or delete as you like!
            </p>
          </div>
          <CreateRoomDialog roomCreated={roomCreated} setroomCreated={setroomCreated} onRoomCreated={fetchRooms} />
        </header>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <RoomSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span className="text-red-500 font-medium">{error}</span>
            <Button className="mt-4" onClick={fetchRooms}>
              Retry
            </Button>
          </div>
        )}

        {/* No Rooms State */}
        {!loading && !error && rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <DoorClosed className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-xl font-semibold mb-1">No rooms found</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any rooms yet.
            </p>
            <CreateRoomDialog roomCreated={roomCreated} setroomCreated={setroomCreated} onRoomCreated={fetchRooms} />
          </div>
        )}

        {/* Room Grid */}
        {!loading && !error && rooms.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.id} className="bg-gray-50 rounded-md hover:shadow-lg transition-shadow border flex flex-col">
                <RoomCard
                  room={room}
                  onClick={() => router.push(`/canvas/${room.id}`)}
                />
                <div className="px-6 pb-5 pt-1">
                  <span className="block text-xs text-gray-400 break-all mb-1">
                    Join code: <span className="font-mono text-gray-800">{room.code}</span>
                  </span>
                  <RoomActions
                    roomId={room.id}
                    currentCode={room.code}
                    onCodeChanged={code => handleRoomCodeChanged(room.id, code)}
                    onRoomDeleted={() => handleRoomDeleted(room.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;