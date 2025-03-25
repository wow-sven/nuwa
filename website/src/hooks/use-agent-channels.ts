import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { Args } from "@roochnetwork/rooch-sdk";
import { useNetworkVariable } from "./use-networks";
import { AgentChannels, Channel } from "../types/channel";

export default function useAgentChannels(id?: string): AgentChannels {
  const client = useRoochClient()
  const packageId = useNetworkVariable('packageId')

  const {
    data: channels,
    isPending,
    isError,
    refetch,
  } = useQuery<Channel[]>({
    queryKey: ['useAgentChannels', id],
    queryFn: async () => {
      // 先获取代理的主频道ID
      const result = await client.executeViewFunction(
        {
          target: `${packageId}::channel::get_agent_home_channel_id`,
          args: [Args.objectId(id!)],
        },
      );

      const homeChannelId = result?.return_values?.[0]?.decoded_value
        ? String(result.return_values[0].decoded_value)
        : '';

      if (!homeChannelId) {
        console.log("No home channel found for this agent");
        return [];
      }

      // 获取该频道的详细信息
      const channelResponse = await client.queryObjectStates({
        filter: {
          object_id: homeChannelId,
        },
      });

      if (channelResponse.data.length === 0) {
        return [];
      }

      const channelData = channelResponse.data[0].decoded_value?.value || {};

      // 转换为Channel对象
      const channel: Channel = {
        id: homeChannelId,
        name: String(channelData.name || '主频道'),
        description: String(channelData.description || ''),
        created_at: Number(channelData.created_at) || Date.now(),
        updated_at: Number(channelData.updated_at) || Date.now(),
        agent_id: id || '',
        member_count: Number(channelData.member_count) || 0,
        message_count: Number(channelData.message_count) || 0
      };

      return [channel];
    },
    enabled: !!id
  })

  return {
    channels: channels || [], isPending, isError, refetch
  }
}