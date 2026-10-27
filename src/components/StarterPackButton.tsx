"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { starterRoutines, starterWorkdays } from "@/data/starterPack";

// Aceita array direto, { data: [] } ou { <chave>: [] }
function extractList(data: unknown, key: string): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record[key])) return record[key] as Record<string, unknown>[];
    if (Array.isArray(record.data)) return record.data as Record<string, unknown>[];
  }

  return [];
}

type Feedback = { type: "success" | "error"; text: string } | null;

export function StarterPackButton({ label = "Carregar rotina sugerida" }: { label?: string }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleClick() {
    const confirmed = window.confirm(
      "Isso vai adicionar à sua conta uma rotina sugerida para vendedores de marketplace (atendimento, pedidos, anúncios, fornecedores, financeiro e revisão semanal). Rotinas que você já tem não serão duplicadas. Deseja continuar?"
    );
    if (!confirmed) return;

    setLoading(true);
    setFeedback(null);

    let created = 0;

    try {
      const existingRoutines = extractList(await api.get<unknown>("/routines"), "routines");
      const existingTitles = new Set(
        existingRoutines.map((routine) => String(routine.title ?? "").trim().toLowerCase())
      );

      const missing = starterRoutines.filter(
        (routine) => !existingTitles.has(routine.title.trim().toLowerCase())
      );

      for (const routine of missing) {
        await api.post("/routines", routine);
        created += 1;
      }

      const existingWorkdays = extractList(
        await api.get<unknown>("/planning/workdays"),
        "workdays"
      );

      let workdaysCreated = false;
      if (existingWorkdays.length === 0) {
        await Promise.all(
          starterWorkdays.map((day) =>
            api.put(`/planning/workdays/${day.weekday}`, {
              enabled: day.enabled,
              startMinutes: day.startMinutes,
              endMinutes: day.endMinutes,
            })
          )
        );
        workdaysCreated = true;
      }

      await queryClient.invalidateQueries();

      const skipped = starterRoutines.length - missing.length;
      const parts = [`${created} rotina(s) adicionada(s)`];
      if (skipped > 0) parts.push(`${skipped} já existia(m)`);
      if (workdaysCreated) parts.push("expediente padrão configurado");

      setFeedback({ type: "success", text: `${parts.join(" · ")}.` });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Erro desconhecido.";
      setFeedback({
        type: "error",
        text: `Não foi possível concluir (${created} rotina(s) criada(s) antes do erro). ${reason} Você pode clicar novamente: o que já foi criado não será duplicado.`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="starter-pack">
      <button className="btn btn-primary" onClick={handleClick} disabled={loading}>
        <Sparkles size={16} />
        {loading ? "Carregando rotina..." : label}
      </button>
      {feedback && (
        <div className={`alert ${feedback.type === "success" ? "alert-success" : "alert-error"}`}>
          {feedback.text}
        </div>
      )}
    </div>
  );
}