export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "POSTPONED"
  | "BLOCKED";
export type Frequency = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  status: TaskStatus;
  priority: Priority;
  estimatedMinutes: number;
  scheduledDate?: string | null;
  dueAt?: string | null;
  preferredStartMin?: number | null;
  blockedReason?: string | null;
  routineId?: string | null;
  createdAt?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority: Priority;
  estimatedMinutes: number;
  dueAt?: string | null;
  status?: TaskStatus;
}

export interface Routine {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  frequency: Frequency;
  weekdays: number[];
  preferredStartMin?: number | null;
  estimatedMinutes: number;
  priority: Priority;
  active: boolean;
}

export interface RoutineInput {
  title: string;
  description?: string;
  frequency: Frequency;
  weekdays: number[];
  preferredStartMin?: number;
  estimatedMinutes: number;
  priority: Priority;
  active: boolean;
}

export interface Workday {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface PlanItem {
  id: string;
  order: number;
  suggestedStart?: string | null;
  score: number;
  reason: string;
  task: Task;
}

export interface TodayPlan {
  date: string;
  workday: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  } | null;
  summary: {
    planned: number;
    completed: number;
    plannedMinutes: number;
    availableMinutes: number;
    remainingMinutes: number;
    overloaded: boolean;
  };
  items: PlanItem[];
}

export interface WeeklyReview {
  weekStart: string;
  stats: {
    completed: number;
    postponed: number;
    overdue: number;
    blocked: number;
  };
  frequentlyPostponed: { title: string; count: number }[];
  review: {
    obstacles?: string | null;
    notes?: string | null;
    nextWeekObjectives?: string | null;
  } | null;
}

export interface WeeklyReviewInput {
  weekStart: string;
  obstacles: string;
  notes: string;
  nextWeekObjectives: string;
}