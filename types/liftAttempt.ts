export interface IInitializeRequest {
  eventId: string; // removed userId
}

import { Attempt } from "@/constants/Player/liveGameTypes"; // or wherever your type is

export interface IInitializeResponse {
  squat: Attempt[];
  bench: Attempt[];
  deadlift: Attempt[];
}

export interface ISubmitNextWeightRequest {
  nextWeight: number;
}

export interface ISubmitNextWeightResponse {
  message: string;
  attempt: any; // You can replace 'any' with your backend attempt model type
}

export interface IUpdateLiftStatusRequest {
  status: "pass" | "fail";
}

export interface IUpdateLiftStatusResponse {
  message: string;
  nextAttempt?: any; // The next attempt that was activated
}
