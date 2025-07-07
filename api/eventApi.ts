import { baseFetcher } from "./baseFetcher";
import {
  ICreateEventRequest,
  ICreateEventResponse,
  IEvent,
} from "@/types/event";
import {
  CREATE_EVENT_URL,
  GET_MY_EVENT_URL,
  GET_EVENT_URL,
} from "@/constants/url/url";

export const createEventAPI = (data: ICreateEventRequest | FormData) =>
  baseFetcher<ICreateEventResponse>(CREATE_EVENT_URL, {
    method: "POST",
    data,
  });

export const getMyEventsAPI = () => {
  return baseFetcher<IEvent[]>(GET_MY_EVENT_URL, {
    method: "GET",
  });
};

export const getAllEventsAPI = () => {
  return baseFetcher<IEvent[]>(GET_EVENT_URL, {
    method: "GET",
  });
};

export const getEventByIdAPI = async (id: string) => {
  return baseFetcher<IEvent>(`/event/${id}`, {
    method: "GET",
  });
};

//Export deleteEventAPI
export const deleteEventAPI = (eventId: string) =>
  baseFetcher<void>(`/events/${eventId}`, { method: "DELETE" });