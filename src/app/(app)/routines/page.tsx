"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PriorityBadge } from "@/components/Badges";
import { Modal } from "@/components/Modal";
import { RoutineForm } from "@/components/RoutineForm";
import { useInvalidatePlanning } from "@/hooks/useInvalidate";
import { api } from "@/lib/api";
import { formatMinutes, frequencyLabel, minutesToTime, weekdayShort } from "@/lib/format";
import type { Routine, RoutineInput } from "@/lib/types";

function describeSchedule(routine: Routine): string {
  const base = frequencyLabel[routine.frequency];
  if (
    (routine.frequency === "WEEKLY" || routine.frequency === "BIWEEKLY") &&
    routine.weekdays.length > 0
  ) {
    return `${base} · ${routine.weekdays.map((d) => weekdayShort[d]).join(", ")}`;
  }
  return base;
}

export default function RoutinesPage() {
  const queryClient = useQueryClient();
  const invalidatePlanning = useInvalidatePlanning();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);

  const routines = useQuery({
    queryKey: ["routines"],
    queryFn: () => api.get<Routine[]>("/routines"),
  });

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["routines"] }),
      invalidatePlanning(),
    ]);
  }

  const save = useMutation({
    mutationFn: (values: RoutineInput) =>
      editing
        ? api.patch<Routine>(`/routines/${editing.id}`, values)
        : api.post<Routine>("/routines", values),
    onSuccess: async () => {
      setCreating(false);
      setEditing(null);
      await refresh();
    },
  });

  const toggle = useMutation({
    mutationFn: (routine: Routine) =>
      api.patch(`/routines/${routine.id}`, { active: !routine.active }),
    onSuccess: () => refresh(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/routines/${id}`),
    onSuccess: () => refresh(),
  });

  function closeModal() {
    setCreating(false);
    setEditing(null);
    save.reset();
  }

  function handleDelete(routine: Routine) {
    if (window.confirm(`Excluir a rotina "${routine.title}"?`)) {
      remove.mutate(routine.id);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Rotinas recorrentes</h1>
          <p className="muted">
            Atividades que se repetem e geram tarefas automaticamente no dia certo.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> Nova rotina
        </button>
      </header>

      {routines.isLoading && <p className="muted">Carregando rotinas...</p>}
      {routines.isError && (
        <div className="alert alert-error">
          {routines.error instanceof Error ? routines.error.message : "Erro ao carregar."}
        </div>
      )}

      {routines.data && routines.data.length === 0 && (
        <div className="empty">
          <p>Você ainda não tem rotinas.</p>
          <p className="muted">
            Comece com atividades como verificar pedidos, responder mensagens e embalar
            produtos.
          </p>
        </div>
      )}

      <div className="card-grid">
        {routines.data?.map((routine) => (
          <article
            key={routine.id}
            className={`card ${routine.active ? "" : "card-inactive"}`}
          >
            <div className="card-top">
              <h3>{routine.title}</h3>
              <PriorityBadge priority={routine.priority} />
            </div>
            {routine.description && <p className="muted small">{routine.description}</p>}
            <p className="small">
              {describeSchedule(routine)}
              {typeof routine.preferredStartMin === "number" &&
  ` · ${minutesToTime(routine.preferredStartMin)}`}
              {` · ${formatMinutes(routine.estimatedMinutes)}`}
            </p>
            <div className="card-actions">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={routine.active}
                  onChange={() => toggle.mutate(routine)}
                />
                <span>Ativa</span>
              </label>
              <div className="row-actions">
                <button
                  className="icon-btn"
                  onClick={() => setEditing(routine)}
                  aria-label="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-btn icon-btn-danger"
                  onClick={() => handleDelete(routine)}
                  aria-label="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {(creating || editing) && (
        <Modal title={editing ? "Editar rotina" : "Nova rotina"} onClose={closeModal}>
          <RoutineForm
            initial={editing ?? undefined}
            loading={save.isPending}
            error={save.error instanceof Error ? save.error.message : undefined}
            onSubmit={(values) => save.mutate(values)}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}