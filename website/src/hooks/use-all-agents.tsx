import { useNetworkVariable } from "./use-networks.ts";
import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { RoochAddress } from "@roochnetwork/rooch-sdk";
import { Agent } from "../types/agent";
import { FEATURED_AGENTS, TRENDING_AGENTS } from "../config/featured-agents";

export default function useAllAgents() {
  const client = useRoochClient()
  const packageId = useNetworkVariable('packageId')

  const {
    data: agents,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['useAllAgents'],
    queryFn: async () => {
      const agentsResponse = await client.queryObjectStates({
        filter: {
          object_type: `${packageId}::agent::Agent`,
        },
      })

      return agentsResponse.data.map(obj => {
        const agentData = obj.decoded_value?.value || {};
        const agentAddress = agentData.agent_address ?
          new RoochAddress(String(agentData.agent_address)).toBech32Address() : '';
        const username = String(agentData.username || 'unnamed');

        return {
          address: agentAddress,
          username,
          name: String(agentData.name || 'Unnamed Agent'),
          avatar: String(agentData.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + agentData.username),
          description: String(agentData.description || 'No description available'),
          lastActive: new Date(Number(agentData.last_active_timestamp) || Date.now()).toISOString(),
          createdAt: new Date(Number(agentData.created_at) || Date.now()).toISOString(),
          modelProvider: "GPT-4",
          agent_address: agentAddress,
          stats: {
            members: 0,
            messageCount: 0,
            balance: 0
          },
          prompt: String(agentData.prompt || ''),
          isFeatured: FEATURED_AGENTS.includes(username as any),
          isTrending: TRENDING_AGENTS.includes(username as any)
        } as Agent;
      })
    },
  })

  return {
    agents: agents ?? [], isPending, isError, refetch
  }
}