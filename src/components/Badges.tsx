import { priorityLabel, statusLabel } from "@/lib/format";
import type { Priority, TaskStatus } from "@/lib/types";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge badge-priority-${priority.toLowerCase()}`}>
      Prioridade {priorityLabel[priority].toLowerCase()}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`badge badge-status-${status.toLowerCase()}`}>
      {statusLabel[status]}
    </span>
  );
}