import { Card } from "@/components/ui/card";

const RoomSkeleton = () => (
  <Card className="animate-pulse transition-shadow border font-inter">
    <div className="flex items-start gap-4 p-6">
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded"></div>
      </div>
    </div>
  </Card>
);

export default RoomSkeleton;