import { Ban, Check, Clock, Lightbulb, Play, SkipForward } from "lucide-react";
import { formatMinutes, formatTime } from "@/lib/format";
import type { PlanItem } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "./Badges";

interface PlanItemCardProps {
  item: PlanItem;
  busy?: boolean;
  onStart: () => void;
  onComplete: () => void;
  onPostpone: () => void;
  onBlock: () => void;
}

export function PlanItemCard({
  item,
  busy,
  onStart,
  onComplete,
  onPostpone,
  onBlock,
}: PlanItemCardProps) {
  const { task } = item;
  const done = task.status === "COMPLETED";
  const inProgress = task.status === "IN_PROGRESS";

  return (
    <article className={`plan-item ${done ? "plan-item-done" : ""}`}>
      <div className="plan-order">{item.order}</div>

      <div className="plan-content">
        <div className="plan-top">
          <h3 className={done ? "line-through" : ""}>{task.title}</h3>
          <span className="plan-time">
            <Clock size={14} /> {formatTime(item.suggestedStart)}
          </span>
        </div>

        <div className="plan-meta">
          <span>{formatMinutes(task.estimatedMinutes)}</span>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          <span className="muted small">Pontuação {item.score.toFixed(0)}</span>
        </div>

        {item.reason && (
          <p className="plan-reason">
            <Lightbulb size={14} /> {item.reason}
          </p>
        )}

        {task.status === "BLOCKED" && task.blockedReason && (
          <p className="plan-blocked">Impedimento: {task.blockedReason}</p>
        )}

        {!done && (
          <div className="plan-actions">
            {!inProgress && (
              <button className="btn btn-sm" onClick={onStart} disabled={busy}>
                <Play size={14} /> Iniciar
              </button>
            )}
            <button
              className="btn btn-sm btn-success"
              onClick={onComplete}
              disabled={busy}
            >
              <Check size={14} /> Concluir
            </button>
            <button className="btn btn-sm" onClick={onPostpone} disabled={busy}>
              <SkipForward size={14} /> Adiar
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={onBlock}
              disabled={busy}
            >
              <Ban size={14} /> Bloquear
            </button>
          </div>
        )}
      </div>
    </article>
  );
}