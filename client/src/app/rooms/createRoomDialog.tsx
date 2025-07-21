import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

function randomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface Props {
  onRoomCreated: () => void;
  roomCreated : boolean , 
  setroomCreated : (roomCreated : boolean)=> void
}

export default function CreateRoomDialog({ onRoomCreated , roomCreated , setroomCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const BackendURL  = process.env.NEXT_PUBLIC_BackendURL

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3 || name.trim().length > 25) {
      setError("Room name must be 3–25 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const code = randomCode();
    try {
      await axios.post(
        `${BackendURL}/web/room`,
        { name: name.trim(), code },
        { withCredentials : true}
      );
      setSuccess("Room created!");
      setName("");
      setOpen(false);
      setroomCreated(!roomCreated);
      onRoomCreated();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || "Could not create room.");
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="gap-2">
          + New Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a Room</DialogTitle>
            <DialogDescription>Give your new room a name (3–25 characters).</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-100 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-2 text-sm text-green-600 bg-green-100 px-3 py-2 rounded-md">
              {success}
            </div>
          )}

          <Input
            value={name}
            disabled={loading}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={25}
            minLength={3}
            placeholder="Room name..."
            className="mt-4"
          />

          <DialogFooter className="flex justify-end mt-5">
            <Button disabled={loading || name.trim().length < 3} type="submit">
              Create Room
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" type="button" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
