"use client";

import { useState, type FormEvent } from "react";
import { dateInputToIso, statusLabel, toDateInput } from "@/lib/format";
import type { Priority, Task, TaskInput, TaskStatus } from "@/lib/types";

interface TaskFormProps {
  initial?: Task;
  loading?: boolean;
  error?: string;
  onSubmit: (values: TaskInput) => void;
  onCancel: () => void;
}

export function TaskForm({
  initial,
  loading,
  error,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "MEDIUM");
  const [minutes, setMinutes] = useState(String(initial?.estimatedMinutes ?? 30));
  const [dueDate, setDueDate] = useState(toDateInput(initial?.dueAt));
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "PENDING");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const values: TaskInput = {
      title: title.trim(),
      description: description.trim(),
      priority,
      estimatedMinutes: Number(minutes),
    };

    const dueIso = dateInputToIso(dueDate);
    if (dueIso) {
      values.dueAt = dueIso;
    } else if (initial) {
      values.dueAt = null;
    }

    if (initial) values.status = status;

    onSubmit(values);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <label className="field">
        <span>Título</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Separar e embalar os pedidos"
        />
      </label>

      <label className="field">
        <span>Descrição (opcional)</span>
        <textarea
          rows={3}
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Prioridade</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
          </select>
        </label>

        <label className="field">
          <span>Duração estimada (min)</span>
          <input
            type="number"
            min={5}
            step={5}
            required
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </label>
      </div>

      <div className="grid-2">
        <label className="field">
          <span>Prazo (opcional)</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>

        {initial && (
          <label className="field">
            <span>Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {(Object.keys(statusLabel) as TaskStatus[]).map((key) => (
                <option key={key} value={key}>
                  {statusLabel[key]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Salvando..." : initial ? "Salvar alterações" : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}