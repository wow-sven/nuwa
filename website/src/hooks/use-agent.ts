import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { RoochAddress } from "@roochnetwork/rooch-sdk";
import { Agent } from "../types/agent";

interface UseAgentResult {
  agent: Agent | undefined;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
}

export default function useAgent(id?: string): UseAgentResult {
  const client = useRoochClient()

  const {
    data: agent,
    isPending,
    isError,
    refetch,
  } = useQuery<Agent | undefined>({
    queryKey: ['useAgent', id],
    queryFn: async () => {
      const agentsResponse = await client.queryObjectStates({
        filter: {
          object_id: id!,
        },
      })

      const agents = agentsResponse.data.map(obj => {
        const agentObj = agentsResponse.data[0];
        const agentData = obj.decoded_value?.value || {};
        const agentAddress = agentData.agent_address ?
          new RoochAddress(String(agentData.agent_address)).toBech32Address() : '';

        return {
          id: agentObj.id,
          name: String(agentData.name || 'Unnamed Agent'),
          username: String(agentData.username || ''),
          description: String(agentData.description || ''),
          instructions: String(agentData.instructions || ''),
          agent_address: agentAddress,
          avatar: String(agentData.avatar || ''),
          model_provider: String(agentData.model_provider || 'Unknown'),
          last_active_timestamp: Number(agentData.last_active_timestamp) || Date.now(),
          prompt: String(agentData.prompt || ''),
        } as Agent;
      })

      return agents[0]
    },
    enabled: !!id
  })

  return {
    agent, isPending, isError, refetch
  }
}