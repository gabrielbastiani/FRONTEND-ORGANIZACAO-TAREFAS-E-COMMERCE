"use client";

import { useState, type FormEvent } from "react";
import {
  frequencyLabel,
  minutesToTime,
  timeToMinutes,
  weekdayShort,
} from "@/lib/format";
import type { Frequency, Priority, Routine, RoutineInput } from "@/lib/types";

interface RoutineFormProps {
  initial?: Routine;
  loading?: boolean;
  error?: string;
  onSubmit: (values: RoutineInput) => void;
  onCancel: () => void;
}

export function RoutineForm({
  initial,
  loading,
  error,
  onSubmit,
  onCancel,
}: RoutineFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "DAILY");
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? [1]);
  const [preferredTime, setPreferredTime] = useState(
    typeof initial?.preferredStartMin === "number"
      ? minutesToTime(initial.preferredStartMin)
      : "09:00"
  );
  const [minutes, setMinutes] = useState(String(initial?.estimatedMinutes ?? 30));
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "MEDIUM");
  const [active, setActive] = useState(initial?.active ?? true);

  const usesWeekdays = frequency === "WEEKLY" || frequency === "BIWEEKLY";

  function toggleWeekday(day: number) {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const values: RoutineInput = {
      title: title.trim(),
      description: (description ?? "").trim(),
      frequency,
      weekdays: usesWeekdays ? [...weekdays].sort((a, b) => a - b) : [],
      estimatedMinutes: Number(minutes),
      priority,
      active,
    };

    if (preferredTime) {
      values.preferredStartMin = timeToMinutes(preferredTime);
    }

    onSubmit(values);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <label className="field">
        <span>Atividade</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: Responder perguntas e mensagens"
        />
      </label>

      <label className="field">
        <span>Descrição (opcional)</span>
        <textarea
          rows={2}
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Frequência</span>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            {(Object.keys(frequencyLabel) as Frequency[]).map((key) => (
              <option key={key} value={key}>
                {frequencyLabel[key]}
              </option>
            ))}
          </select>
        </label>

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
      </div>

      {usesWeekdays && (
        <div className="field">
          <span>Dias preferenciais</span>
          <div className="chips">
            {weekdayShort.map((label, day) => (
              <button
                type="button"
                key={label}
                className={`chip ${weekdays.includes(day) ? "chip-active" : ""}`}
                onClick={() => toggleWeekday(day)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid-2">
        <label className="field">
          <span>Horário sugerido</span>
          <input
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
          />
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

      <label className="checkbox">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <span>Rotina ativa</span>
      </label>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Salvando..." : initial ? "Salvar alterações" : "Criar rotina"}
        </button>
      </div>
    </form>
  );
}