import { useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Props {
  roomId: number;
  currentCode: string;
  onCodeChanged: (newCode: string) => void;
  onRoomDeleted: () => void;
}

export default function RoomActions({ roomId, currentCode, onCodeChanged, onRoomDeleted }: Props) {
  const [changingCode, setChangingCode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const joinUrl = `${backendUrl}/web/join-room/${roomId}?roomId=${roomId}&code=${currentCode}`;

  async function handleChangeCode() {
    setChangingCode(true);
    setMessage(null);
    setError(null);
    try {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let newCode = "";
      for (let i = 0; i < 6; i++) {
        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      await axios.patch(
        `${backendUrl}/web/code/${roomId}`,{
           newCode 
          },{
             withCredentials : true
            }
      );

      setMessage(`Room code updated: ${newCode}`);
      onCodeChanged(newCode);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || "Error changing code.");
    }
    setChangingCode(false);
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    setDeleting(true);
    setMessage(null);
    setError(null);
    try {
      await axios.delete(`${backendUrl}/web/room/${roomId}`, {
        withCredentials : true
      });
      setMessage("Room deleted.");
      onRoomDeleted();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || "Error deleting room.");
    }
    setDeleting(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(joinUrl);
    setMessage("Copied Join URL!");
    setError(null);
  }

  return (
    <div className="flex flex-col gap-2 mt-4">
      {(message || error) && (
        <div
          className={`text-sm p-2 rounded-md ${
            error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" type="button" onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-1" />
          Copy Join URL
        </Button>
        <Button className="hover : cursor-pointer"
          variant="secondary"
          size="sm"
          type="button"
          disabled={changingCode}
          onClick={handleChangeCode}
        >
          Change Code
        </Button>
        <Button className="hover : cursor-pointer"
          variant="destructive"
          type="button"
          size="sm"
          disabled={deleting}
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}
