"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { Modal } from "@/components/Modal";
import { TaskForm } from "@/components/TaskForm";
import { useInvalidatePlanning } from "@/hooks/useInvalidate";
import { api } from "@/lib/api";
import { formatDateBr, formatMinutes, statusLabel } from "@/lib/format";
import type { Task, TaskInput, TaskStatus } from "@/lib/types";

export default function TasksPage() {
  const invalidate = useInvalidatePlanning();
  const [filter, setFilter] = useState<TaskStatus | "">("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const tasks = useQuery({
    queryKey: ["tasks", filter],
    queryFn: () => api.get<Task[]>("/tasks", { status: filter || undefined }),
  });

  const save = useMutation({
    mutationFn: (values: TaskInput) =>
      editing
        ? api.patch<Task>(`/tasks/${editing.id}`, values)
        : api.post<Task>("/tasks", values),
    onSuccess: async () => {
      setCreating(false);
      setEditing(null);
      await invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => invalidate(),
  });

  function closeModal() {
    setCreating(false);
    setEditing(null);
    save.reset();
  }

  function handleDelete(task: Task) {
    if (window.confirm(`Excluir a tarefa "${task.title}"?`)) remove.mutate(task.id);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Tarefas</h1>
          <p className="muted">Atividades avulsas e tarefas geradas pelas rotinas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> Nova tarefa
        </button>
      </header>

      <div className="filters">
        <button
          className={`chip ${filter === "" ? "chip-active" : ""}`}
          onClick={() => setFilter("")}
        >
          Todas
        </button>
        {(Object.keys(statusLabel) as TaskStatus[]).map((status) => (
          <button
            key={status}
            className={`chip ${filter === status ? "chip-active" : ""}`}
            onClick={() => setFilter(status)}
          >
            {statusLabel[status]}
          </button>
        ))}
      </div>

      {tasks.isLoading && <p className="muted">Carregando tarefas...</p>}
      {tasks.isError && (
        <div className="alert alert-error">
          {tasks.error instanceof Error ? tasks.error.message : "Erro ao carregar."}
        </div>
      )}

      {tasks.data && tasks.data.length === 0 && (
        <div className="empty">
          <p>Nenhuma tarefa encontrada.</p>
        </div>
      )}

      {tasks.data && tasks.data.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Tarefa</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Duração</th>
                <th>Prazo</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {tasks.data.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                    {task.description && (
                      <div className="muted small">{task.description}</div>
                    )}
                  </td>
                  <td>
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td>
                    <StatusBadge status={task.status} />
                  </td>
                  <td>{formatMinutes(task.estimatedMinutes)}</td>
                  <td>{formatDateBr(task.dueAt)}</td>
                  <td className="row-actions">
                    <button
                      className="icon-btn"
                      onClick={() => setEditing(task)}
                      aria-label="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => handleDelete(task)}
                      aria-label="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <Modal title={editing ? "Editar tarefa" : "Nova tarefa"} onClose={closeModal}>
          <TaskForm
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