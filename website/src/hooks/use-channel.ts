import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { CHANNEL_STATUS, Channel, ChannelStatus } from "../types/channel";

interface ChannelInfo {
  channel: Channel | null;
  active: boolean;
  agentAddress: string;
}

interface UseChannelResult {
  channelInfo: ChannelInfo | undefined;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
}

export default function useChannel(id?: string): UseChannelResult {
  const client = useRoochClient()

  const {
    data: channelInfo,
    isPending,
    isError,
    refetch,
  } = useQuery<ChannelInfo>({
    queryKey: ['useChannel', id],
    queryFn: async () => {
      const result = await client.queryObjectStates(
        {
          filter: {
            object_id: id!,
          }
        }
      );

      if (!result?.data?.[0]) {
        return {
          channel: null,
          active: false,
          agentAddress: ''
        };
      }

      const channelData = result.data[0].decoded_value?.value || {};
      const isChannelActive = channelData?.status === CHANNEL_STATUS.ACTIVE;
      const agentAddress = channelData?.creator as string || '';

      const channel: Channel = {
        id: id!,
        name: String(channelData.name || ''),
        description: String(channelData.description || ''),
        created_at: Number(channelData.created_at) || Date.now(),
        updated_at: Number(channelData.updated_at) || Date.now(),
        agent_id: String(channelData.agent_id || ''),
        member_count: Number(channelData.member_count) || 0,
        message_count: Number(channelData.message_count) || 0,
        status: channelData.status !== undefined ? Number(channelData.status) as ChannelStatus : undefined
      };

      return {
        channel,
        active: isChannelActive,
        agentAddress
      };
    },
    enabled: !!id
  });

  return {
    channelInfo, isPending, isError, refetch
  }
}