import type {
  PlanItem,
  Priority,
  Task,
  TaskStatus,
  TodayPlan,
  Workday,
} from "./types";
import { minutesToTime } from "./format";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizePriority(value: unknown): Priority {
  const priority = String(value ?? "MEDIUM").toUpperCase();

  if (priority === "HIGH") return "HIGH";
  if (priority === "LOW") return "LOW";

  return "MEDIUM";
}

function normalizeStatus(value: unknown): TaskStatus {
  const status = String(value ?? "PENDING").toUpperCase();

  if (status === "IN_PROGRESS") return "IN_PROGRESS";
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "POSTPONED") return "POSTPONED";
  if (status === "BLOCKED") return "BLOCKED";

  return "PENDING";
}

function normalizeDate(value: unknown): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return new Date().toISOString();
}

function normalizeTask(value: unknown, fallbackId: string): Task {
  const raw = asRecord(value);

  const id = asString(
    raw.id ?? raw.taskId ?? raw.uuid,
    fallbackId
  );

  const title = asString(
    raw.title ?? raw.name ?? raw.description,
    "Tarefa sem título"
  );

  const estimatedMinutes = asNumber(
    raw.estimatedMinutes ??
      raw.durationMinutes ??
      raw.duration ??
      raw.estimatedTime,
    0
  );

  const dueRaw = raw.dueAt ?? raw.dueDate;

  return {
    id,
    title,
    description:
      raw.description !== undefined
        ? asString(raw.description)
        : null,
    status: normalizeStatus(raw.status),
    priority: normalizePriority(raw.priority),
    estimatedMinutes,
    dueAt: typeof dueRaw === "string" ? dueRaw : null,
scheduledDate: typeof raw.scheduledDate === "string" ? raw.scheduledDate : null,
preferredStartMin:
  typeof raw.preferredStartMin === "number" ? raw.preferredStartMin : null,
    blockedReason:
      raw.blockedReason !== undefined && raw.blockedReason !== null
        ? asString(raw.blockedReason)
        : null,
    routineId:
      raw.routineId !== undefined && raw.routineId !== null
        ? asString(raw.routineId)
        : null,
    createdAt:
      raw.createdAt !== undefined && raw.createdAt !== null
        ? asString(raw.createdAt)
        : undefined,
  };
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

function normalizeWorkday(value: unknown): TodayPlan["workday"] {
  if (!isRecord(value)) {
    return null;
  }

  return {
    enabled: asBoolean(value.enabled, true),
    startTime: readTime(
      value.startMinutes,
      value.startTime ?? value.start ?? value.startHour,
      "09:00"
    ),
    endTime: readTime(
      value.endMinutes,
      value.endTime ?? value.end ?? value.endHour,
      "18:00"
    ),
  };
}

function calculateAvailableMinutes(
  workday: TodayPlan["workday"]
): number {
  if (!workday) return 0;

  const startParts = workday.startTime.split(":").map(Number);
  const endParts = workday.endTime.split(":").map(Number);

  const startHour = startParts[0] ?? 9;
  const startMinute = startParts[1] ?? 0;
  const endHour = endParts[0] ?? 18;
  const endMinute = endParts[1] ?? 0;

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  if (endTotal <= startTotal) return 0;

  return endTotal - startTotal;
}

function normalizePlanItem(
  value: unknown,
  index: number
): PlanItem {
  const raw = asRecord(value);

  const rawTask =
    raw.task ??
    raw.activity ??
    raw.item ??
    value;

  const task = normalizeTask(rawTask, `temporary-task-${index}`);

  return {
    id: asString(
      raw.id ?? raw.planItemId ?? raw.taskId,
      task.id
    ),
    order: asNumber(
      raw.order ?? raw.position ?? raw.sequence,
      index + 1
    ),
    suggestedStart:
      raw.suggestedStart !== undefined && raw.suggestedStart !== null
        ? asString(raw.suggestedStart)
        : raw.startTime !== undefined && raw.startTime !== null
        ? asString(raw.startTime)
        : null,
    score: asNumber(raw.score ?? raw.priorityScore, 0),
    reason: asString(
      raw.reason ?? raw.justification ?? raw.explanation,
      ""
    ),
    task,
  };
}

function extractPayload(value: unknown): UnknownRecord {
  const root = asRecord(value);

  if (isRecord(root.data)) {
    return root.data;
  }

  if (isRecord(root.plan)) {
    return root.plan;
  }

  if (isRecord(root.result)) {
    return root.result;
  }

  return root;
}

function extractRawItems(payload: UnknownRecord): unknown[] {
  const possibleItems =
    payload.items ??
    payload.tasks ??
    payload.planItems ??
    payload.plannedTasks ??
    payload.activities ??
    [];

  if (Array.isArray(possibleItems)) {
    return possibleItems;
  }

  return [];
}

export function normalizeTodayPlan(value: unknown): TodayPlan {
  const payload = extractPayload(value);
  const rawItems = extractRawItems(payload);

  const items = rawItems.map((item, index) =>
    normalizePlanItem(item, index)
  );

  const rawSummary = isRecord(payload.summary)
    ? payload.summary
    : isRecord(payload.metrics)
    ? payload.metrics
    : {};

  const completedFromItems = items.filter(
    (item) => item.task.status === "COMPLETED"
  ).length;

  const plannedMinutesFromItems = items.reduce(
    (total, item) => total + item.task.estimatedMinutes,
    0
  );

  const workday = normalizeWorkday(
    payload.workday ??
      payload.todayWorkday ??
      payload.schedule ??
      null
  );

  const planned = asNumber(
    rawSummary.planned ??
      rawSummary.total ??
      rawSummary.totalTasks,
    items.length
  );

  const completed = asNumber(
    rawSummary.completed ??
      rawSummary.completedTasks,
    completedFromItems
  );

  const plannedMinutes = asNumber(
    rawSummary.plannedMinutes ??
      rawSummary.totalMinutes,
    plannedMinutesFromItems
  );

  const availableMinutes = asNumber(
    rawSummary.availableMinutes ??
      rawSummary.remainingAvailableMinutes,
    calculateAvailableMinutes(workday)
  );

  const remainingMinutes = asNumber(
    rawSummary.remainingMinutes,
    Math.max(availableMinutes - plannedMinutes, 0)
  );

  const overloaded =
    rawSummary.overloaded !== undefined
      ? asBoolean(rawSummary.overloaded)
      : plannedMinutes > availableMinutes;

  return {
    date: normalizeDate(payload.date ?? payload.day),
    workday,
    summary: {
      planned,
      completed,
      plannedMinutes,
      availableMinutes,
      remainingMinutes,
      overloaded,
    },
    items,
  };
}

import type { WeeklyReview } from "./types";

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function normalizeReview(value: unknown): WeeklyReview {
  const root = asRecord(value);
  const payload = isRecord(root.data) ? root.data : root;

  const stats = asRecord(payload.stats ?? payload.summary ?? payload);
  const saved = isRecord(payload.review) ? payload.review : payload;

  const rawFrequent =
    payload.frequentlyPostponed ??
    payload.frequentPostponed ??
    payload.postponedOften ??
    [];

  const frequentlyPostponed = (Array.isArray(rawFrequent) ? rawFrequent : []).map(
    (item) => {
      const raw = asRecord(item);
      const task = asRecord(raw.task);
      return {
        title: asString(raw.title ?? task.title, "Tarefa"),
        count: asNumber(raw.count ?? raw.postponedCount ?? raw.times, 0),
      };
    }
  );

  return {
    weekStart: asString(payload.weekStart),
    stats: {
      completed: asNumber(stats.completed ?? stats.completedTasks),
      postponed: asNumber(stats.postponed ?? stats.postponedTasks),
      overdue: asNumber(stats.overdue ?? stats.overdueTasks),
      blocked: asNumber(stats.blocked ?? stats.blockedTasks),
    },
    frequentlyPostponed,
    review: {
      obstacles: readString(saved.obstacles),
      notes: readString(saved.notes),
      nextWeekObjectives: readString(saved.nextWeekObjectives),
    },
  };
}