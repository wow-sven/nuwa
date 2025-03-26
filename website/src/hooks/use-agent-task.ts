// const { data: taskSpecsResponse, isLoading: isTaskSpecsQueryLoading } =
// useRoochClientQuery(
//   "executeViewFunction",
//   {
//     target: `${packageId}::agent::get_agent_task_specs_json`,
//     args: [Args.objectId(agentId || "")],
//   },
//   {
//     enabled: !!client && !!packageId && !!agentId,
//   }
// );

// TODO
import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { Args } from "@roochnetwork/rooch-sdk";
import { useNetworkVariable } from "./use-networks";
import { AgentStatus } from "../types/agent";

interface UseAgentStatusResult {
  status: AgentStatus;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
}

export default function useAgentTask(id?: string): UseAgentStatusResult {
  const client = useRoochClient();
  const packageId = useNetworkVariable("packageId");

  const {
    data: agentStatus,
    isPending,
    isError,
    refetch,
  } = useQuery<AgentStatus>({
    queryKey: ["useAgentStatus", id],
    queryFn: async () => {
      const result = await client.executeViewFunction({
        target: `${packageId}::agent::is_processing_request`,
        args: [Args.objectId(id!)],
      });

      const isProcessing = result?.return_values?.[0]?.decoded_value
        ? Boolean(result.return_values[0].decoded_value)
        : false;

      const lastActiveResult = await client.executeViewFunction({
        target: `${packageId}::agent::get_last_active_timestamp`,
        args: [Args.objectId(id!)],
      });

      const lastActive = lastActiveResult?.return_values?.[0]?.decoded_value
        ? Number(lastActiveResult.return_values[0].decoded_value)
        : Date.now();

      return {
        isOnline: !isProcessing,
        lastActive,
        currentTask: isProcessing ? "processing" : undefined
      };
    },
    enabled: !!id,
  });

  return {
    status: agentStatus || { isOnline: false, lastActive: Date.now() },
    isPending,
    isError,
    refetch,
  };
}
