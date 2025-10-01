
import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";

type Room = {
  id: string;
  name: string;
  createdAt: string;
};

interface Props {
  room: Room;
  onClick: () => void;
}

function formatDate(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const RoomCard = ({ room, onClick }: Props) => (
  <Card
    onClick={onClick}
    className="cursor-pointer transition-shadow hover:shadow-lg border bg-background animate-fade-in font-inter group"
    tabIndex={0}
    role="button"
    aria-label={`Open room ${room.name}`}
  >
    <div className="flex items-start gap-4 p-6">
      <div className="flex-shrink-0 bg-primary/10 rounded-full p-3 group-hover:bg-primary/20 transition-colors">
        <CalendarDays className="h-7 w-7 text-primary" />
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-1 text-foreground">{room.name}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 opacity-70" />
          <span>Created {formatDate(room.createdAt)}</span>
        </div>
      </div>
    </div>
  </Card>
);

export default RoomCard;