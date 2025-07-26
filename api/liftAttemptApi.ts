import {
  IInitializeRequest,
  IInitializeResponse,
  ISubmitNextWeightRequest,
  ISubmitNextWeightResponse,
  IUpdateLiftStatusRequest,
  IUpdateLiftStatusResponse,
} from "@/types/liftAttempt";
import { baseFetcher } from "./baseFetcher";
import {
  INITIALIZE_ATTEMPTS,
  GET_LIFT_ATTEMPTS_URL,
  SUBMIT_NEXT_WEIGHT_URL,
  UPDATE_LIFT_STATUS_URL,
} from "@/constants/url/url";
import { Attempt, LiftType } from "@/constants/Player/liveGameTypes";

export const initializeLiftAttemptsAPI = (data: IInitializeRequest) =>
  baseFetcher<IInitializeResponse>(INITIALIZE_ATTEMPTS, {
    method: "POST",
    data,
  });

// Response format: { squat: Attempt[], bench: Attempt[], deadlift: Attempt[] }
export const getLiftAttemptsAPI = (userId: string, eventId: string) => {
  return baseFetcher<Record<LiftType, Attempt[]>>(
    `${GET_LIFT_ATTEMPTS_URL}/${userId}/${eventId}`,
    {
      method: "GET",
    }
  );
};

export const submitNextWeightAPI = (
  attemptId: string,
  data: ISubmitNextWeightRequest
) =>
  baseFetcher<ISubmitNextWeightResponse>(
    SUBMIT_NEXT_WEIGHT_URL.replace(":attemptId", attemptId),
    {
      method: "PATCH",
      data,
    }
  );

export const updateLiftStatusAPI = (
  attemptId: string,
  data: IUpdateLiftStatusRequest
) =>
  baseFetcher<IUpdateLiftStatusResponse>(
    UPDATE_LIFT_STATUS_URL.replace(":attemptId", attemptId),
    {
      method: "PATCH",
      data,
    }
  );
