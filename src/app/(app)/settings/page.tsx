"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useInvalidatePlanning } from "@/hooks/useInvalidate";
import { api } from "@/lib/api";
import { minutesToTime, timeToMinutes, weekdayNames } from "@/lib/format";
import type { Workday } from "@/lib/types";

function defaultWorkdays(): Workday[] {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    enabled: weekday >= 1 && weekday <= 5,
    startTime: "09:00",
    endTime: "18:00",
  }));
}

function readTime(minutes: unknown, time: unknown, fallback: string): string {
  if (typeof minutes === "number" && Number.isFinite(minutes)) {
    return minutesToTime(minutes);
  }
  if (typeof time === "string" && time.length >= 5) {
    return time.slice(0, 5);
  }
  return fallback;
}

function mergeWithDefaults(data: unknown): Workday[] {
  const base = defaultWorkdays();

  const list: unknown[] = Array.isArray(data)
    ? data
    : data &&
      typeof data === "object" &&
      Array.isArray((data as { data?: unknown }).data)
    ? ((data as { data: unknown[] }).data)
    : [];

  return base.map((day) => {
    const found = list.find(
      (item) =>
        item &&
        typeof item === "object" &&
        (item as { weekday?: unknown }).weekday === day.weekday
    ) as Record<string, unknown> | undefined;

    if (!found) return day;

    return {
      weekday: day.weekday,
      enabled: typeof found.enabled === "boolean" ? found.enabled : day.enabled,
      startTime: readTime(found.startMinutes, found.startTime, day.startTime),
      endTime: readTime(found.endMinutes, found.endTime, day.endTime),
    };
  });
}

export default function SettingsPage() {
  const invalidate = useInvalidatePlanning();
  const [days, setDays] = useState<Workday[]>(defaultWorkdays());
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState("");

  const workdays = useQuery({
    queryKey: ["workdays"],
    queryFn: () => api.get<unknown>("/planning/workdays"),
  });

  useEffect(() => {
    if (workdays.data !== undefined) {
      setDays(mergeWithDefaults(workdays.data));
    }
  }, [workdays.data]);

  const save = useMutation({
    mutationFn: () =>
      Promise.all(
        days.map((day) =>
          api.put(`/planning/workdays/${day.weekday}`, {
            enabled: day.enabled,
            startMinutes: timeToMinutes(day.startTime),
            endMinutes: timeToMinutes(day.endTime),
          })
        )
      ),
    onSuccess: async () => {
      await Promise.all([workdays.refetch(), invalidate()]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  function update(weekday: number, patch: Partial<Workday>) {
    setDays((current) =>
      current.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day))
    );
  }

  function handleSave() {
    setValidationError("");
    setSaved(false);

    const invalid = days.find(
      (day) =>
        day.enabled && timeToMinutes(day.endTime) <= timeToMinutes(day.startTime)
    );

    if (invalid) {
      setValidationError(
        `${weekdayNames[invalid.weekday]}: o horário final precisa ser maior que o inicial.`
      );
      return;
    }

    save.mutate();
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Expediente</h1>
          <p className="muted">
            Defina os dias e horários em que você trabalha. O plano diário usa esse
            tempo disponível para decidir o que cabe no dia.
          </p>
        </div>
      </header>

      {workdays.isLoading && <p className="muted">Carregando...</p>}
      {workdays.isError && (
        <div className="alert alert-error">
          {workdays.error instanceof Error ? workdays.error.message : "Erro ao carregar."}
        </div>
      )}

      <div className="card workday-list">
        {days.map((day) => (
          <div key={day.weekday} className="workday-row">
            <label className="checkbox workday-name">
              <input
                type="checkbox"
                checked={day.enabled}
                onChange={(e) => update(day.weekday, { enabled: e.target.checked })}
              />
              <span>{weekdayNames[day.weekday]}</span>
            </label>

            <div className="workday-times">
              <input
                type="time"
                value={day.startTime}
                disabled={!day.enabled}
                onChange={(e) => update(day.weekday, { startTime: e.target.value })}
              />
              <span className="muted">até</span>
              <input
                type="time"
                value={day.endTime}
                disabled={!day.enabled}
                onChange={(e) => update(day.weekday, { endTime: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      {validationError && <div className="alert alert-error">{validationError}</div>}
      {save.isError && (
        <div className="alert alert-error">
          {save.error instanceof Error ? save.error.message : "Erro ao salvar."}
        </div>
      )}
      {saved && <div className="alert alert-success">Expediente salvo com sucesso.</div>}

      <div className="form-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={save.isPending}
        >
          {save.isPending ? "Salvando..." : "Salvar expediente"}
        </button>
      </div>
    </div>
  );
}