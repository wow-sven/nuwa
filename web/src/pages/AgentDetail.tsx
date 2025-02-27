import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useNetworkVariable } from '../hooks/useNetworkVariable';
import { useRoochClient, useRoochClientQuery, SessionKeyGuard } from '@roochnetwork/rooch-sdk-kit';
import { Agent, Character } from '../types/agent';
import { Args } from '@roochnetwork/rooch-sdk';

export function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [homeChannelId, setHomeChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHomeChannelLoading, setIsHomeChannelLoading] = useState(true);
  
  const navigate = useNavigate();
  const packageId = useNetworkVariable('packageId');
  const client = useRoochClient();
  
  // Query the specific agent by ID
  const { data: agentResponse, isLoading: isAgentLoading, error: agentError } = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        object_id: agentId,
      },
    },
    {
      enabled: !!client && !!packageId && !!agentId,
    }
  );

  // Query home channel ID using executeViewFunction
  const { data: homeChannelResponse, isLoading: isHomeChannelQueryLoading } = useRoochClientQuery(
    'executeViewFunction',
    {
      target: `${packageId}::channel::get_agent_home_channel_id`,
      args: agentId ? [Args.objectId(agentId)] : [],
    },
    {
      enabled: !!client && !!packageId && !!agentId,
    }
  );

  // Effect to process agent data and fetch character
  useEffect(() => {
    if (isAgentLoading) {
      setIsLoading(true);
      return;
    }

    if (agentError) {
      console.error('Failed to fetch agent details:', agentError);
      setError('Failed to load agent details. Please try again.');
      setIsLoading(false);
      return;
    }

    const processAgentData = async () => {
      try {
        console.log('Agent response:', agentResponse);
        console.log('Home channel response:', homeChannelResponse);

        if (agentResponse?.data && agentResponse.data.length > 0) {
          
          // Get the first agent from the array
          const agentObj = agentResponse.data[0];
          const agentData = agentObj.decoded_value.value;
          console.log('Agent data:', agentData);
          
          // Get the character ID from the agent data
          const characterId = agentData.character?.value?.id;
          const agentAddress = agentData.agent_address;
          
          // Create the agent object
          const processedAgent: Agent = {
            id: agentObj.id,
            name: 'Loading...', // Will be updated when character is loaded
            owner: agentAddress,
            characterId: characterId,
            modelProvider: agentData.model_provider || 'Unknown',
            createdAt: parseInt(agentData.last_active_timestamp) || Date.now(),
          };
          
          setAgent(processedAgent);
          
          // If we have a character ID, fetch the character details
          if (characterId && client) {
            try {
              // Use queryObjectStates instead of getObject
              const characterResponse = await client.queryObjectStates({
                filter: {
                  object_id: characterId,
                },
              });
              
              if (characterResponse?.data?.[0]?.decoded_value?.value) {
                const characterObj = characterResponse.data[0];
                const characterData = characterObj.decoded_value.value;
                
                const characterDetails: Character = {
                  id: characterId,
                  name: characterData.name || 'Unnamed Character',
                  username: characterData.username || '',
                  description: characterData.description || ''
                };
                
                setCharacter(characterDetails);
                
                // Update agent with character name and description
                setAgent(prev => prev ? {
                  ...prev,
                  name: characterDetails.name,
                  description: characterDetails.description
                } : null);
              }
            } catch (err) {
              console.error('Failed to fetch character details:', err);
              // We don't set an error here as the agent was still loaded
            }
          }
        } else {
          setError('Agent not found');
        }
      } catch (err) {
        console.error('Error processing agent data:', err);
        setError('Failed to process agent data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    processAgentData();
  }, [agentResponse, isAgentLoading, agentError, client, agentId]);

  // Add a separate useEffect to handle the home channel response
  useEffect(() => {
    // Check if home channel query has completed (either with data or null)
    if (!isHomeChannelQueryLoading) {
      console.log('Home channel response:', homeChannelResponse);
      
      if (homeChannelResponse?.return_values?.[0]?.decoded_value) {
        setHomeChannelId(homeChannelResponse.return_values[0].decoded_value);
      } else {
        console.log('No home channel found for this agent');
      }
      
      // Always set loading to false when query completes
      setIsHomeChannelLoading(false);
    }
  }, [homeChannelResponse, isHomeChannelQueryLoading]);

  // Add a timeout as a fallback to prevent infinite loading
  useEffect(() => {
    // Set a timeout to reset loading state after 10 seconds as a fallback
    const timeout = setTimeout(() => {
      if (isHomeChannelLoading) {
        console.log('Home channel loading timeout - resetting loading state');
        setIsHomeChannelLoading(false);
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeout);
  }, [isHomeChannelLoading]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !agent) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error || 'Agent not found'}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Agents
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Agents
        </button>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{agent.name}</h3>
            {agent.description && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">{agent.description}</p>
            )}
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Agent ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">{agent.id}</dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Owner</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">{agent.owner}</dd>
              </div>

              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Model Provider</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="px-2 py-1 bg-blue-50 rounded text-blue-600 text-xs">
                    {agent.modelProvider}
                  </span>
                </dd>
              </div>
              
              {character && (
                <>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Character Username</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      @{character.username}
                    </dd>
                  </div>
                  
                  {character.description && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Character Description</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                        {character.description}
                      </dd>
                    </div>
                  )}
                </>
              )}
              
              {agent.createdAt && (
                <div className={`${character?.description ? 'bg-white' : 'bg-gray-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                  <dt className="text-sm font-medium text-gray-500">Last Active</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(agent.createdAt).toLocaleString()}
                  </dd>
                </div>
              )}
              
              {agent.characterId && (
                <div className={`${character?.description || agent.createdAt ? 'bg-white' : 'bg-gray-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                  <dt className="text-sm font-medium text-gray-500">Character ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">{agent.characterId}</dd>
                </div>
              )}
              
              {/* Home Channel section with loading state */}
              <div className={`${(agent.characterId || agent.createdAt) && (!character?.description) ? 'bg-white' : 'bg-gray-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                <dt className="text-sm font-medium text-gray-500">Home Channel</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">
                  {isHomeChannelLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-blue-500 border-r-2 rounded-full"></div>
                      <span className="text-gray-500">Loading home channel...</span>
                    </div>
                  ) : homeChannelId ? (
                    <>
                      <span className="break-all">{homeChannelId}</span>
                      <button 
                        onClick={() => navigate(`/channel/${homeChannelId}`)}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        View
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-500">No home channel found</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Agent interactions would go here */}
        <div className="mt-8 p-6 bg-white shadow sm:rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Chat with Agent</h3>
          <p className="text-gray-600 mb-4">Interact with AI agent by sending messages.</p>
          
          <div className="mt-4 flex flex-wrap gap-3">
            {isHomeChannelLoading ? (
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-400 cursor-not-allowed"
                disabled
              >
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-white border-r-2 rounded-full"></div>
                Loading Home Channel...
              </button>
            ) : homeChannelId ? (
              <SessionKeyGuard onClick={() => {
                navigate(`/channel/${homeChannelId}`);
              }}>
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Home Channel
              </button>
            </SessionKeyGuard>
            ) : (
              <button 
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                disabled
              >
                No Home Channel Available
              </button>
            )}
            <SessionKeyGuard onClick={() => {
              navigate(`/create-channel?agent=${agent.id}`);
            }}>
              <button 
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                New Peer Chat
              </button>
            </SessionKeyGuard>
          </div>
        </div>
      </div>
    </Layout>
  );
}