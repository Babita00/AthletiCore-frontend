import { useMutation, useQueryClient } from "react-query";
import { deleteEventAPI } from "@/api/eventAPI";

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation((id: string) => deleteEventAPI(id), {
    onSuccess: () => qc.invalidateQueries("my-events"),
  });
};
