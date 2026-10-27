"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addWeeks, endOfWeek, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { api } from "@/lib/api";
import type { WeeklyReview, WeeklyReviewInput } from "@/lib/types";
import { normalizeReview } from "@/lib/normalizers";

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const [reference, setReference] = useState(new Date());

  const weekStartDate = startOfWeek(reference, { weekStartsOn: 1 });
  const weekEndDate = endOfWeek(reference, { weekStartsOn: 1 });
  const weekStart = format(weekStartDate, "yyyy-MM-dd");

  const [obstacles, setObstacles] = useState("");
  const [notes, setNotes] = useState("");
  const [nextWeekGoals, setNextWeekGoals] = useState("");
  const [saved, setSaved] = useState(false);

  const review = useQuery({
  queryKey: ["review", weekStart],
  queryFn: async () => {
    const response = await api.get<unknown>("/reviews", { weekStart });
    return normalizeReview(response);
  },
});;

  useEffect(() => {
  setObstacles(review.data?.review?.obstacles ?? "");
  setNotes(review.data?.review?.notes ?? "");
  setNextWeekGoals(review.data?.review?.nextWeekObjectives ?? "");
}, [review.data]);

  const save = useMutation({
    mutationFn: (values: WeeklyReviewInput) => api.put("/reviews", values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["review", weekStart] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  function handleSubmit(event: FormEvent) {
  event.preventDefault();
  save.mutate({ weekStart, obstacles, notes, nextWeekObjectives: nextWeekGoals });
}

  const stats = review.data?.stats;
  const frequent = review.data?.frequentlyPostponed ?? [];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Revisão semanal</h1>
          <p className="muted">
            Semana de {format(weekStartDate, "dd/MM", { locale: ptBR })} a{" "}
            {format(weekEndDate, "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => setReference((d) => addWeeks(d, -1))}>
            <ChevronLeft size={16} /> Anterior
          </button>
          <button className="btn" onClick={() => setReference(new Date())}>
            Esta semana
          </button>
          <button className="btn" onClick={() => setReference((d) => addWeeks(d, 1))}>
            Próxima <ChevronRight size={16} />
          </button>
        </div>
      </header>

      {review.isLoading && <p className="muted">Carregando revisão...</p>}
      {review.isError && (
        <div className="alert alert-error">
          {review.error instanceof Error ? review.error.message : "Erro ao carregar."}
        </div>
      )}

      {stats && (
        <section className="stats stats-4">
          <StatCard label="Concluídas" value={stats.completed} />
          <StatCard label="Adiadas" value={stats.postponed} />
          <StatCard label="Atrasadas" value={stats.overdue} />
          <StatCard label="Bloqueadas" value={stats.blocked} />
        </section>
      )}

      <section className="card">
        <h2>Atividades frequentemente postergadas</h2>
        {frequent.length === 0 ? (
          <p className="muted">Nenhuma atividade foi adiada repetidamente nesta semana.</p>
        ) : (
          <ul className="simple-list">
            {frequent.map((item) => (
              <li key={item.title}>
                <span>{item.title}</span>
                <strong>{item.count}x adiada</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form className="card form" onSubmit={handleSubmit}>
        <h2>Registro da semana</h2>

        <label className="field">
          <span>Obstáculos encontrados</span>
          <textarea
            rows={3}
            value={obstacles}
            onChange={(e) => setObstacles(e.target.value)}
            placeholder="O que atrapalhou a execução do plano?"
          />
        </label>

        <label className="field">
          <span>Ajustes na rotina</span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="O que precisa mudar em estimativas, horários ou frequência?"
          />
        </label>

        <label className="field">
          <span>Objetivos para a próxima semana</span>
          <textarea
            rows={3}
            value={nextWeekGoals}
            onChange={(e) => setNextWeekGoals(e.target.value)}
            placeholder="Ex.: melhorar anúncios, organizar a embalagem, buscar fornecedores"
          />
        </label>

        {save.isError && (
          <div className="alert alert-error">
            {save.error instanceof Error ? save.error.message : "Erro ao salvar."}
          </div>
        )}
        {saved && <div className="alert alert-success">Revisão salva.</div>}

        <div className="form-actions">
          <button className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar revisão"}
          </button>
        </div>
      </form>
    </div>
  );
}