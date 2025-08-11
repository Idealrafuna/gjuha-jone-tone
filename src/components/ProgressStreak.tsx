import { Flame } from "lucide-react";

export const ProgressStreak = ({ days = 0 }: { days?: number }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
      <Flame className="text-primary" />
      <span>Streak: <strong>{days}</strong> days</span>
    </div>
  );
};
