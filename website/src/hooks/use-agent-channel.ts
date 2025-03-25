import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { Args } from "@roochnetwork/rooch-sdk";
import { useNetworkVariable } from "./use-networks";

export default function useAgentChannel(id?: string) {
  const client = useRoochClient();
  const packageId = useNetworkVariable("packageId");

  const {
    data: channel,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["useAgentChannels", id],
    queryFn: async () => {
      const result = await client.executeViewFunction({
        target: `${packageId}::channel::get_agent_home_channel_id`,
        args: [Args.objectId(id!)],
      });

      if (result?.return_values?.[0]?.decoded_value) {
        return String(result.return_values[0].decoded_value);
      } else {
        console.log("No home channel found for this agent");
      }

      return "";
    },
    enabled: !!id,
  });

  return {
    channel: channel,
    isPending,
    isError,
    refetch,
  };
}
