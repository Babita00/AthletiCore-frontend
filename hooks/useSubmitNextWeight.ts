import { useMutation } from "@tanstack/react-query";
import { submitNextWeightAPI } from "@/api/liftAttemptApi";

export const useSubmitNextWeight = () => {
  return useMutation({
    mutationFn: ({
      attemptId,
      nextWeight,
    }: {
      attemptId: string;
      nextWeight: number;
    }) => submitNextWeightAPI(attemptId, { nextWeight }),
  });
};
