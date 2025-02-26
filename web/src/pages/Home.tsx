import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useNetworkVariable } from '../hooks/useNetworkVariable';
import { useRoochClient, useRoochClientQuery, useCurrentSession, WalletGuard } from '@roochnetwork/rooch-sdk-kit';
import { Agent, CharacterReference } from '../types/agent';

export function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const packageId = useNetworkVariable('packageId');
  const client = useRoochClient();
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
      // Refresh every 10 seconds
      refetchInterval: 10000,
      // Also refetch when window regains focus
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

  useEffect(() => {
    if (isQueryLoading || isCharactersLoading) {
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
        const characterDataMap = new Map();
        if (charactersResponse?.data) {
          charactersResponse.data.forEach(obj => {
            const characterData = obj.decoded_value.value;
            characterDataMap.set(obj.id, {
              id: obj.id,
              name: characterData.name || 'Unnamed Character',
              username: characterData.username || '',
              description: characterData.description || ''
            });
          });
        }
        
        // Transform the agent objects
        const parsedAgents = agentsResponse.data.map(obj => {
          const agentData = obj.decoded_value.value;
          console.log('agentData', agentData);
          
          // Get the character ID from the reference
          const characterId = agentData.character?.value?.id;
          // Look up character data from our map
          const characterData = characterId ? characterDataMap.get(characterId) : null;
          
          return {
            id: obj.id,
            name: characterData?.name || 'Unnamed Agent',
            description: characterData?.description || '',
            characterId: characterId,
            owner: agentData.agent_address, // Using agent_address as owner
            modelProvider: agentData.model_provider || 'Unknown',
            createdAt: parseInt(agentData.last_active_timestamp) || Date.now(),
          };
        });
        
        // If session exists, filter to show only the user's agents
        const userAgents = session?.address 
          ? parsedAgents.filter(agent => agent.owner === session.address)
          : parsedAgents;
          
        // Sort agents by creation time (newest first)
        const sortedAgents = userAgents.sort((a, b) => b.createdAt - a.createdAt);
        
        setAgents(sortedAgents);
      } catch (err) {
        console.error('Failed to parse agents:', err);
        setError('Error parsing agent data. Please try again.');
      }
    } else {
      setAgents([]);
    }
    
    setIsLoading(false);
  }, [agentsResponse, charactersResponse, isQueryLoading, isCharactersLoading, queryError, session]);

  const handleAgentClick = (agent: Agent) => {
    navigate(`/agent/${agent.id}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your AI Agents</h1>
          <p className="text-gray-600">Create and manage your onchain AI agents</p>
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
            <p className="text-lg text-gray-600 mb-6">You don't have any AI agents yet.</p>
            <WalletGuard onClick={() => navigate('/create-agent')}>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
              >
                Create Your First Agent
              </button>
            </WalletGuard>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                onClick={() => handleAgentClick(agent)}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h2 className="text-xl font-semibold mb-2">{agent.name}</h2>
                {agent.description && (
                  <p className="text-gray-600 mb-4">{agent.description}</p>
                )}
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {agent.owner && (
                      <>
                        {agent.owner.substring(0, 8)}...{agent.owner.substring(agent.owner.length - 6)}
                      </>
                    )}
                  </div>
                  <div className="px-2 py-1 bg-blue-50 rounded text-blue-600 text-xs">
                    {agent.modelProvider}
                  </div>
                </div>
                <div className="text-gray-500 text-xs mt-3">
                  Last active: {new Date(agent.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}