import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { Args } from "@roochnetwork/rooch-sdk";
import { useNetworkVariable } from "./use-networks";

export default function useAgentStatus(id?: string) {
  const client = useRoochClient();
  const packageId = useNetworkVariable("packageId");

  const {
    data: agentStatus,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["useAgentStatus", id],
    queryFn: async () => {
      const result = await client.executeViewFunction({
        target: `${packageId}::agent::is_processing_request`,
        args: [Args.objectId(id!)],
      });

      if (result?.return_values?.[0]?.decoded_value) {
        return Boolean(result.return_values[0].decoded_value);
      } else {
        console.log("No home channel found for this agent");
      }

      return false;
    },
    enabled: !!id,
  });

  return {
    channels: agentStatus || false,
    isPending,
    isError,
    refetch,
  };
}
