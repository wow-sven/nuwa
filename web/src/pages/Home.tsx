import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useNetworkVariable } from '../hooks/useNetworkVariable';
import { useRoochClient, useRoochClientQuery, useCurrentWallet, useCurrentSession, SessionKeyGuard, WalletGuard } from '@roochnetwork/rooch-sdk-kit';
import { Agent, AgentStatus, AgentStats, isAgent } from '../types/agent';
import type { AnnotatedMoveValueView } from '@roochnetwork/rooch-sdk';

interface AgentData {
  agent_address: string;
  model_provider: string;
  agentname: string;
  name: string;
  description: string;
  last_active_timestamp: string;
  prompt: string;
  character?: {
    value?: {
      id: string;
    };
  };
}

interface CharacterData {
  id: string;
  name: string;
  username: string;
  description: string;
}

const defaultStats: AgentStats = {
  members: 0,
  price: 0,
  marketCap: 0
};

export function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'authorized'>('all');
  const [userAuthorizedAgentIds, setUserAuthorizedAgentIds] = useState<Set<string>>(new Set());

  const packageId = useNetworkVariable('packageId');
  const client = useRoochClient();
  const wallet = useCurrentWallet();
  const session = useCurrentSession();
  const navigate = useNavigate();

  // Query all Agent objects using useRoochClientQuery
  const { data: agentsResponse, isLoading: isQueryLoading, error: queryError } = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        object_type: `${packageId}::agent::Agent`,
      },
    },
    {
      enabled: !!client && !!packageId,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    }
  );

  // Query to fetch character details for all agents
  const { data: charactersResponse, isLoading: isCharactersLoading } = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        object_type: `${packageId}::character::Character`,
      },
    },
    {
      enabled: !!client && !!packageId,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    }
  );

  // Query to fetch AgentCap objects for the current user
  const { data: agentCapsResponse, isLoading: isAgentCapsLoading } = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        object_type_with_owner: {
          object_type: `${packageId}::agent_cap::AgentCap`,
          owner: wallet?.wallet?.getBitcoinAddress().toStr(),
        },
      },
    },
    {
      enabled: !!client && !!packageId && !!wallet?.wallet,
      refetchOnWindowFocus: true,
    }
  );

  useEffect(() => {
    if (isQueryLoading || isCharactersLoading || isAgentCapsLoading) {
      setIsLoading(true);
      return;
    }

    if (queryError) {
      console.error('Failed to fetch agents:', queryError);
      setError('Failed to load agents. Please try again.');
      setIsLoading(false);
      return;
    }

    if (agentsResponse?.data) {
      try {
        // First, create a map of character data by ID
        const characterDataMap = new Map<string, CharacterData>();
        if (charactersResponse?.data) {
          charactersResponse.data.forEach(obj => {
            if (obj.decoded_value?.value) {
              const rawCharacterData = obj.decoded_value.value as Record<string, any>;
              const characterData: CharacterData = {
                id: obj.id,
                name: String(rawCharacterData.name || ''),
                username: String(rawCharacterData.username || ''),
                description: String(rawCharacterData.description || '')
              };
              characterDataMap.set(obj.id, characterData);
            }
          });
        }

        // Transform the agent objects
        const parsedAgents = agentsResponse.data.map(obj => {
          if (!obj.decoded_value?.value) return null;

          const rawAgentData = obj.decoded_value.value as Record<string, any>;
          const agentData: AgentData = {
            agent_address: String(rawAgentData.agent_address || ''),
            model_provider: String(rawAgentData.model_provider || ''),
            agentname: String(rawAgentData.agentname || ''),
            name: String(rawAgentData.name || ''),
            description: String(rawAgentData.description || ''),
            last_active_timestamp: String(rawAgentData.last_active_timestamp || new Date().toISOString()),
            prompt: String(rawAgentData.prompt || ''),
            character: rawAgentData.character
          };

          // Get the character ID from the reference
          const characterId = agentData.character?.value?.id;
          // Look up character data from our map
          const characterData = characterId ? characterDataMap.get(characterId) : null;

          const agent: Agent = {
            id: obj.id,
            agent_address: agentData.agent_address || '',
            modelProvider: agentData.model_provider || 'Unknown',
            agentname: agentData.agentname || '',
            name: characterData?.name || agentData.name || 'Unnamed Agent',
            description: characterData?.description || agentData.description || '',
            lastActive: agentData.last_active_timestamp || new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agentData.agentname || obj.id}`,
            stats: defaultStats,
            status: 'online' as AgentStatus,
            prompt: agentData.prompt || ''
          };

          return isAgent(agent) ? agent : null;
        }).filter((agent): agent is Agent => agent !== null);

        // Create a Set of agent object IDs that the user has capability for
        const newUserAuthorizedAgentIds = new Set<string>();
        if (agentCapsResponse?.data && wallet?.wallet) {
          agentCapsResponse.data.forEach(obj => {
            if (obj.decoded_value?.value) {
              const rawCapData = obj.decoded_value.value as Record<string, any>;
              const agentObjId = String(rawCapData.agent_obj_id || '');
              if (agentObjId) {
                newUserAuthorizedAgentIds.add(agentObjId);
              }
            }
          });
          console.log('User has capabilities for agents:', newUserAuthorizedAgentIds);
        }

        // Update the state with the authorized agent IDs
        setUserAuthorizedAgentIds(newUserAuthorizedAgentIds);

        // Apply filter based on agent caps
        const filteredAgents = filter === 'authorized' && session?.getRoochAddress()
          ? parsedAgents.filter(agent => newUserAuthorizedAgentIds.has(agent.id))
          : parsedAgents;

        // Sort agents by last active time
        const sortedAgents = filteredAgents.sort((a, b) =>
          new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        );

        setAgents(sortedAgents);
      } catch (err) {
        console.error('Failed to parse agents:', err);
        setError('Error parsing agent data. Please try again.');
      }
    } else {
      setAgents([]);
    }

    setIsLoading(false);
  }, [agentsResponse, charactersResponse, agentCapsResponse, isQueryLoading, isCharactersLoading, isAgentCapsLoading, queryError, session, filter]);

  const handleAgentClick = (agent: Agent) => {
    navigate(`/agent/${agent.id}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header with filter tabs */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Agents</h1>
            <p className="text-gray-600">Discover and interact with autonomous onchain AI agents</p>
          </div>

          {/* Create Agent Button - Always visible */}
          <div className="mt-4 sm:mt-0">
            <SessionKeyGuard onClick={() => navigate('/studio')}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Launch AI Agent
              </button>
            </SessionKeyGuard>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setFilter('all')}
              className={`${filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              All Agents
            </button>
            {wallet && (
              <WalletGuard onClick={() => setFilter('authorized')}>
                <button
                  className={`${filter === 'authorized'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                >
                  Agents You Authorized
                </button>
              </WalletGuard>
            )}
          </nav>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-6">
              {filter === 'authorized'
                ? "You don't have authorized control of any agents yet."
                : "No AI agents found on the network."}
            </p>
            <SessionKeyGuard onClick={() => navigate('/studio')}>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
              >
                Create New Agent
              </button>
            </SessionKeyGuard>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => handleAgentClick(agent)}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-full bg-gray-100" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-500">@{agent.agentname}</p>
                  </div>
                </div>
                {agent.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{agent.description}</p>
                )}
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${agent.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                    {agent.status}
                  </div>
                  <div className="px-2 py-1 bg-blue-50 rounded text-blue-600 text-xs">
                    {agent.modelProvider}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}