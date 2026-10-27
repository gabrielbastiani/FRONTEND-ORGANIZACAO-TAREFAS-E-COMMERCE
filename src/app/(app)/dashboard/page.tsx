"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { StarterPackButton } from "@/components/StarterPackButton";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Copy, RefreshCw } from "lucide-react";
import { BlockDialog } from "@/components/BlockDialog";
import { PlanItemCard } from "@/components/PlanItemCard";
import { StatCard } from "@/components/StatCard";
import { useInvalidatePlanning } from "@/hooks/useInvalidate";
import { api } from "@/lib/api";
import { formatMinutes, formatTime, priorityLabel } from "@/lib/format";
import type { PlanItem, TodayPlan } from "@/lib/types";
import { normalizeTodayPlan } from "@/lib/normalizers";

type ActionKind = "start" | "complete" | "postpone" | "block";

interface ActionVars {
  id: string;
  kind: ActionKind;
  reason?: string;
}

export default function DashboardPage() {
  const invalidate = useInvalidatePlanning();
  const [blocking, setBlocking] = useState<PlanItem | null>(null);
  const [copied, setCopied] = useState(false);

  const today = useQuery({
    queryKey: ["today"],
    queryFn: async () => {
      const response = await api.get<unknown>("/planning/today");

      console.log("Resposta original de /planning/today:", response);
      
      return normalizeTodayPlan(response);
    },
  });

  const action = useMutation({
    mutationFn: ({ id, kind, reason }: ActionVars) => {
      switch (kind) {
        case "start":
          return api.patch(`/tasks/${id}`, { status: "IN_PROGRESS" });
        case "complete":
          return api.post(`/planning/tasks/${id}/complete`);
        case "postpone":
          return api.post(`/planning/tasks/${id}/postpone`);
        case "block":
  return api.post(`/planning/tasks/${id}/block`, {
    reason,
    blockedReason: reason,
  });
      }
    },
    onSuccess: async () => {
      setBlocking(null);
      await invalidate();
    },
  });

  const recalculate = useMutation({
    mutationFn: () => api.post("/planning/recalculate"),
    onSuccess: () => invalidate(),
  });

  async function copyPlan(plan: TodayPlan) {
  const safeItems = Array.isArray(plan.items) ? plan.items : [];

  const title = format(new Date(), "dd/MM/yyyy");

  const lines = safeItems.map(
    (item) =>
      `${item.order}. ${formatTime(item.suggestedStart)} - ${
        item.task.title
      } (${formatMinutes(item.task.estimatedMinutes)}, prioridade ${
        priorityLabel[item.task.priority].toLowerCase()
      })`
  );

  const text =
    lines.length > 0
      ? `Plano do dia - ${title}\n\n${lines.join("\n")}`
      : `Plano do dia - ${title}\n\nNenhuma tarefa planejada.`;

  await navigator.clipboard.writeText(text);

  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);
}

  if (today.isLoading) {
    return <p className="muted">Montando seu plano do dia...</p>;
  }

  if (today.isError || !today.data) {
    return (
      <div className="alert alert-error">
        {today.error instanceof Error
          ? today.error.message
          : "Não foi possível carregar o plano."}
      </div>
    );
  }

  const plan = today.data ?? normalizeTodayPlan(null);
  const safeItems = Array.isArray(plan.items) ? plan.items : [];
  const { summary } = plan;
  const progress =
    summary.planned > 0
      ? Math.round((summary.completed / summary.planned) * 100)
      : 0;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Meu dia de trabalho</h1>
          <p className="muted">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            {plan.workday?.enabled &&
              ` · Expediente ${plan.workday.startTime} às ${plan.workday.endTime}`}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn"
            onClick={() => copyPlan(plan)}
            disabled={safeItems.length === 0}
          >
            <Copy size={16} /> {copied ? "Copiado!" : "Copiar plano do dia"}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => recalculate.mutate()}
            disabled={recalculate.isPending}
          >
            <RefreshCw size={16} />
            {recalculate.isPending ? "Reorganizando..." : "Reorganizar dia"}
          </button>
        </div>
      </header>

      <section className="stats">
        <StatCard label="Planejadas" value={summary.planned} />
        <StatCard label="Concluídas" value={summary.completed} />
        <StatCard
          label="Tempo restante"
          value={formatMinutes(summary.remainingMinutes)}
          hint={`${formatMinutes(summary.plannedMinutes)} planejados de ${formatMinutes(
            summary.availableMinutes,
          )} disponíveis`}
        />
      </section>

      <div className="progress" aria-label={`Progresso: ${progress}%`}>
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {summary.overloaded && (
        <div className="alert alert-warning">
          <AlertTriangle size={18} />
          <span>
            O tempo planejado é maior do que o disponível no expediente. Adie
            tarefas flexíveis ou use &quot;Reorganizar dia&quot; para
            redistribuir o plano.
          </span>
        </div>
      )}

      {action.isError && (
        <div className="alert alert-error">
          {action.error instanceof Error
            ? action.error.message
            : "Falha na ação."}
        </div>
      )}

      <section>
        <h2>Sua lista de prioridades</h2>

        {safeItems.length === 0 ? (
          <div className="empty">
            <StarterPackButton label="Começar com a rotina sugerida" />
            <p>Nenhuma tarefa planejada para hoje.</p>
            <p className="muted">
              Cadastre rotinas e tarefas, e confira se hoje é um dia de trabalho
              em Expediente.
            </p>
          </div>
        ) : (
          <div className="plan-list">
            {safeItems.map((item) => (
              <PlanItemCard
                key={item.id}
                item={item}
                busy={action.isPending}
                onStart={() =>
                  action.mutate({
                    id: item.task.id,
                    kind: "start",
                  })
                }
                onComplete={() =>
                  action.mutate({
                    id: item.task.id,
                    kind: "complete",
                  })
                }
                onPostpone={() =>
                  action.mutate({
                    id: item.task.id,
                    kind: "postpone",
                  })
                }
                onBlock={() => setBlocking(item)}
              />
            ))}
          </div>
        )}
      </section>

      {blocking && (
        <BlockDialog
          taskTitle={blocking.task.title}
          loading={action.isPending}
          onClose={() => setBlocking(null)}
          onConfirm={(reason) =>
            action.mutate({ id: blocking.task.id, kind: "block", reason })
          }
        />
      )}
    </div>
  );
}
