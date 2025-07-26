import { useMutation } from "@tanstack/react-query";
import { updateLiftStatusAPI } from "@/api/liftAttemptApi";

export const useUpdateLiftStatus = () => {
  return useMutation({
    mutationFn: ({
      attemptId,
      status,
    }: {
      attemptId: string;
      status: "pass" | "fail";
    }) => updateLiftStatusAPI(attemptId, { status }),
  });
};
