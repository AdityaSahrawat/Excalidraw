"use client"

import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import RoomSkeleton from "./roomSkeleton";
import RoomCard from "./roomCard";
import CreateRoomDialog from "./createRoomDialog";
import RoomActions from "./roomAction";
import {DoorClosed, Loader2 ,ArrowLeft, LogIn, Copy, Eye, EyeOff, LogOut} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logout, logoutButtonClass } from "@/lib/auth";

type Room = {
  id: string;
  name: string;
  createdAt: string;
  code: string; 
};

type JoinedRoom = {
  id: string; // joinedRooms id
  roomId: string;
  joinedAt: string;
  room?: {
    id: string;
    name: string;
    code: string;
  }
};


const Index = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [roomCreated , setroomCreated] = useState<boolean>(false)
  const BackendURL  = process.env.NEXT_PUBLIC_BACKEND_URL

  const [joinedRooms, setJoinedRooms] = useState<JoinedRoom[]>([]);
  const [hiddenCodes, setHiddenCodes] = useState<Record<string, boolean>>({});
  
  const fetchRooms = useCallback(() => {
    setLoading(true);
    setError(null);
    axios.get(`${BackendURL}/web/rooms`, {
        withCredentials : true
      })
      .then((response) => {
        setRooms(response.data.rooms || []);
        setJoinedRooms(response.data.joinedRooms || []);
      })
      .catch(() => {
        setError("Failed to load rooms.");
        setRooms([]);
        setJoinedRooms([]);
      })
      .finally(() => setLoading(false));
  }, [BackendURL]);

  const toggleCode = useCallback((roomId: string) => {
    setHiddenCodes(prev => ({...prev, [roomId]: !prev[roomId]}));
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setJoinMessage("Copied!");
      setTimeout(()=> setJoinMessage(null), 1500);
    } catch {/* silent */}
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(()=>{ fetchRooms(); } , [roomCreated, fetchRooms]);

  function handleRoomCodeChanged(roomId: string, newCode: string) {
    setRooms(prevRooms =>
      prevRooms.map(r => r.id === roomId ? { ...r, code: newCode } : r)
    );
  }

  function handleRoomDeleted(roomId: string) {
    setRooms(prevRooms => prevRooms.filter(r => r.id !== roomId));
  }

  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent){
    e.preventDefault();
    setJoinMessage(null);
    if(!joinRoomId.trim() || !joinCode.trim()){
      setJoinMessage("Room ID and code required");
      return;
    }
    setJoinLoading(true);
    try {
      const res = await axios.post(`${BackendURL}/web/join-room`, { roomId: joinRoomId.trim(), code: joinCode.trim() }, { withCredentials: true });
      setJoinMessage(res.data.already ? "Already in room" : "Joined successfully");
      fetchRooms();
      setJoinRoomId("");
      setJoinCode("");
    } catch (err) {
      interface AxiosLikeError { response?: { status?: number; data?: { message?: string } } }
      const e = err as AxiosLikeError;
      const status = e.response?.status;
      if(status === 404){
        setJoinMessage("Room not found or code mismatch");
      } else if(status === 400){
        setJoinMessage(e.response?.data?.message || "Bad request");
      } else {
        setJoinMessage("Failed to join room");
      }
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-start py-12 px-6 font-sans">
      <div className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
  <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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
          <div className="flex flex-col gap-4 w-full sm:w-auto">
            <div className="flex gap-2 items-center">
              <CreateRoomDialog roomCreated={roomCreated} setroomCreated={setroomCreated} onRoomCreated={fetchRooms} />
              <Button onClick={logout} variant="outline" className={`flex items-center gap-2 ${logoutButtonClass}`}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end bg-gray-50 p-4 rounded-md border">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" htmlFor="join-room-id">Room ID</label>
                <Input id="join-room-id" placeholder="room id" value={joinRoomId} onChange={e=>setJoinRoomId(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" htmlFor="join-code">Code</label>
                <Input id="join-code" placeholder="code" value={joinCode} maxLength={6} onChange={e=>setJoinCode(e.target.value)} />
              </div>
              <Button type="submit" disabled={joinLoading} className="mt-2 sm:mt-0 flex items-center gap-1">
                <LogIn className="w-4 h-4" /> {joinLoading?"Joining...":"Join"}
              </Button>
            </form>
            {joinMessage && <p className="text-xs text-gray-600" role="status">{joinMessage}</p>}
          </div>
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

        {/* Admin Rooms */}
        {!loading && !error && rooms.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Your Admin Rooms</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <div key={room.id} className="bg-gray-50 rounded-md hover:shadow-lg transition-shadow border flex flex-col">
                  <RoomCard
                    room={room}
                    onClick={() => router.push(`/canvas/${room.id}`)}
                  />
                  <div className="px-6 pb-5 pt-1">
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Room ID:</span>
                        <button type="button" onClick={()=>copyToClipboard(String(room.id))} className="text-xs font-mono underline-offset-2 hover:underline flex items-center gap-1">
                          {room.id}
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Join code:</span>
                        <button type="button" onClick={()=>copyToClipboard(room.code)} className="text-xs font-mono underline-offset-2 hover:underline flex items-center gap-1">
                          {hiddenCodes[room.id] ? '••••••' : room.code}
                          <Copy className="w-3 h-3" />
                        </button>
                        <button type="button" aria-label={hiddenCodes[room.id]? 'Show code':'Hide code'} onClick={()=>toggleCode(room.id)} className="p-1 rounded hover:bg-gray-200">
                          {hiddenCodes[room.id] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
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
          </section>
        )}

        {/* Joined Rooms (non-admin) */}
        {!loading && !error && joinedRooms.length > 0 && (
          <section className="space-y-3 mt-10">
            <h2 className="text-xl font-semibold">Joined Rooms</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {joinedRooms.map(j => (
                <div key={j.id} className="bg-white rounded-md border p-4 flex flex-col justify-between hover:shadow">
                  <div>
                    <p className="font-medium text-gray-800">{j.room?.name || j.roomId}</p>
                    <p className="text-xs text-gray-500 mt-1">Joined: {new Date(j.joinedAt).toLocaleString()}</p>
                    {j.room?.code && (
                      <p className="text-xs mt-2 text-gray-600">Code: <span className="font-mono">{j.room.code}</span></p>
                    )}
                  </div>
                  <div className="mt-3">
                    <Button variant="secondary" size="sm" onClick={() => router.push(`/canvas/${j.roomId}`)}>Open</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Index;