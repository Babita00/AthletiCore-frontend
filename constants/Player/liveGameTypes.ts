// Type definitions
export type AttemptStatus = "available" | "pending" | "submitted";
export type AttemptResult = "success" | "failed" | null;
export type LiftType = "squat" | "bench" | "deadlift";

export interface Attempt {
  id?: string; // Backend attempt ID for API calls
  round: number;
  weight: number;
  status: AttemptStatus;
  result: AttemptResult;
  locked: boolean;
  changes: number;
}

export interface PendingSubmission {
  lift: LiftType;
  round: number;
  weight: number;
}

export interface Athlete {
  name: string;
  weightClass: string;
  bodyWeight: string;
}
export interface LiftAttempt {
  best: number;
  attempts: string[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  weightClass: string;
  bodyWeight: string;
  squat: LiftAttempt;
  bench: LiftAttempt;
  deadlift: LiftAttempt;
  total: number;
  glPoints: number;
  isRecord: boolean;
  recentChange: boolean;
  isCurrentUser?: boolean;
  [key: string]: any;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}
