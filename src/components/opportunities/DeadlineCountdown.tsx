import { Clock, AlertTriangle } from "lucide-react";
import { differenceInDays, differenceInHours, parseISO } from "date-fns";

interface DeadlineCountdownProps {
  deadline: string | null;
  compact?: boolean;
}

const DeadlineCountdown = ({ deadline, compact = false }: DeadlineCountdownProps) => {
  if (!deadline) return null;

  const deadlineDate = parseISO(deadline);
  const now = new Date();
  const daysLeft = differenceInDays(deadlineDate, now);
  const hoursLeft = differenceInHours(deadlineDate, now);

  // Determine urgency color
  let colorClass = "text-primary bg-primary/10";
  let urgencyText = "";
  
  if (daysLeft < 0) {
    colorClass = "text-muted-foreground bg-muted";
    urgencyText = "Scaduto";
  } else if (daysLeft <= 3) {
    colorClass = "text-destructive bg-destructive/10";
    urgencyText = hoursLeft <= 24 ? `${hoursLeft}h rimaste` : `${daysLeft}g rimasti`;
  } else if (daysLeft <= 7) {
    colorClass = "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30";
    urgencyText = `${daysLeft} giorni`;
  } else if (daysLeft <= 14) {
    colorClass = "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30";
    urgencyText = `${daysLeft} giorni`;
  } else {
    urgencyText = `${daysLeft} giorni`;
  }

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
        {daysLeft <= 7 ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {urgencyText}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${colorClass}`}>
      {daysLeft <= 7 ? (
        <AlertTriangle className="w-4 h-4" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{urgencyText}</span>
        {daysLeft > 0 && (
          <span className="text-xs opacity-80">
            Scade il {deadlineDate.toLocaleDateString('it-IT')}
          </span>
        )}
      </div>
    </div>
  );
};

export default DeadlineCountdown;
