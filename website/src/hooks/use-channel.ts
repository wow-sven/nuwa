import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { CHANNEL_STATUS } from "../types/channel";

export default function useChannel(id?: string) {
  const client = useRoochClient();

  const {
    data: channelInfo,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["useChannel", id],
    queryFn: async () => {
      const result = await client.queryObjectStates({
        filter: {
          object_id: id!,
        },
      });
      console.log("channel", result);
      const channel = result?.data?.[0]?.decoded_value?.value;

      const isChannelActive = channel?.status === CHANNEL_STATUS.ACTIVE;
      let aiAddress = channel?.creator as string;

      return {
        active: isChannelActive,
        // createAt: last_active,
        agentAddress: aiAddress,
      };
    },
    enabled: !!id,
  });

  return {
    channelInfo,
    isPending,
    isError,
    refetch,
  };
}
