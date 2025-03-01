import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useNetworkVariable } from '../hooks/useNetworkVariable';
import { useRoochClient, useRoochClientQuery, useCurrentWallet, SessionKeyGuard } from '@roochnetwork/rooch-sdk-kit';
import { Agent, Character, Memory } from '../types/agent';
import { Args, isValidAddress, bcs } from '@roochnetwork/rooch-sdk';
import { MemoryBrowser } from '../components/MemoryBrowser';
import { MemorySchema } from '../types/agent'; // We'll create this
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [homeChannelId, setHomeChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHomeChannelLoading, setIsHomeChannelLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'memories'>('details');
  
  const navigate = useNavigate();
  const packageId = useNetworkVariable('packageId');
  const client = useRoochClient();
  const wallet = useCurrentWallet();
  
  // Add these state variables
  const [selfMemories, setSelfMemories] = useState<Memory[]>([]);
  const [userMemories, setUserMemories] = useState<Memory[]>([]);
  const [isLoadingSelfMemories, setIsLoadingSelfMemories] = useState(false);
  const [isLoadingUserMemories, setIsLoadingUserMemories] = useState(false);
  const [searchAddress, setSearchAddress] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
            agent_address: agentAddress,
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


  // Fetch agent's self memories
  useEffect(() => {
    const fetchSelfMemories = async () => {
      if (!client || !packageId || !agent?.id) return;
      
      // Add this check to prevent refetching if we already have memories
      if (selfMemories.length > 0) {
        console.log('Self memories already loaded, skipping fetch');
        return;
      }
      
      try {
        setIsLoadingSelfMemories(true);
        
        const response = await client.executeViewFunction({
          target: `${packageId}::agent::get_agent_self_memories`,
          args: [Args.objectId(agent.id)],
        });
        
        // Use BCS to deserialize memories
        let memories: Memory[] = deserializeMemories(response);
        
        setSelfMemories(memories);
        console.log(`Loaded ${memories.length} self memories`);
      } catch (error) {
        console.error('Failed to fetch agent self memories:', error);
      } finally {
        setIsLoadingSelfMemories(false);
      }
    };

    if (agent && client && packageId) {
      fetchSelfMemories();
    }
  }, [agent?.id, client, packageId]); // Remove selfMemories from dependencies

  // Fetch memories about current user
  useEffect(() => {
    const fetchCurrentUserMemories = async () => {
      if (!client || !packageId || !agent?.id || !wallet?.wallet) return;
      
      // Add this check to prevent refetching if we already have memories
      if (userMemories.length > 0) {
        console.log('User memories already loaded, skipping fetch');
        return;
      }
      
      try {
        setIsLoadingUserMemories(true);
        
        const userAddress = wallet.wallet?.getBitcoinAddress().toStr();
        
        const response = await client.executeViewFunction({
          target: `${packageId}::agent::get_agent_memories_about_user`,
          args: [
            Args.objectId(agent.id),
            Args.address(userAddress)
          ],
        });
        
        // Use BCS to deserialize memories
        let memories: Memory[] = deserializeMemories(response);
        
        setUserMemories(memories);
        console.log(`Loaded ${memories.length} user memories`);
      } catch (error) {
        console.error('Failed to fetch agent memories about current user:', error);
      } finally {
        setIsLoadingUserMemories(false);
      }
    };

    if (agent && wallet?.wallet && client && packageId) {
      fetchCurrentUserMemories();
    }
  }, [agent?.id, wallet?.wallet, client, packageId]); // Remove userMemories from dependencies

  // Handle address search
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchAddress || !client || !packageId || !agent?.id) return;
    
    try {
      setIsSearching(true);
    
      if (!isValidAddress(searchAddress)) {
        throw new Error('Invalid address format');
      }
      
      const response = await client.executeViewFunction({
        target: `${packageId}::agent::get_agent_memories_about_user`,
        args: [
          Args.objectId(agent.id),
          Args.address(searchAddress)
        ],
      });
      
      // Use BCS to deserialize memories
      let memories: Memory[] = deserializeMemories(response);
      
      setSearchResults(memories);
    } catch (error) {
      console.error('Failed to search memories:', error);
      alert('Failed to search memories. Please check the address format.');
    } finally {
      setIsSearching(false);
    }
  };

  // Helper to map memory response to our type
  const deserializeMemories = (response: any): Memory[] => {
    if (!response?.return_values?.[0]?.value?.value) {
      console.log('No memory data available in response');
      return [];
    }
  
    try {
      // Get the hex value from the response
      const hexValue = response.return_values[0].value.value;
      
      // Convert hex to bytes
      const cleanHexValue = hexValue.startsWith('0x') ? hexValue.slice(2) : hexValue;
      const bytes = new Uint8Array(
        cleanHexValue.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      
      // Parse using BCS
      if (!MemorySchema) {
        console.error('MemorySchema is not defined!');
        return [];
      }
      
      const parsedMemories = bcs.vector(MemorySchema).parse(bytes);
      console.log(`Successfully parsed ${parsedMemories.length} memories`);
      
      // Map to our Memory interface format
      return parsedMemories.map((memory: any) => ({
        index: memory.index || 0,
        content: memory.content || '',
        context: memory.context || '',
        timestamp: parseInt(memory.timestamp) || Date.now(),
      }));
    } catch (error) {
      console.error('Memory BCS deserialization error:', error);
      return [];
    }
  };

  // Add a clean-up action to the address search function to clear results when input is cleared
  const handleSearchAddressChange = (value: string) => {
    setSearchAddress(value);
    if (!value) {
      // Clear search results when the input is cleared
      setSearchResults([]);
    }
  };

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
        
        <div className="mb-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{agent.name}</h3>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('details')}
              className={`${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Agent Details
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`${
                activeTab === 'memories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              Memories
              {isLoadingSelfMemories && (
                <div className="ml-2 animate-spin h-4 w-4 border-t-2 border-blue-500 border-r-2 rounded-full"></div>
              )}
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'details' ? (
          <>
            {/* Agent Details Tab */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Agent ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">{agent.id}</dd>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Agent Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">{agent.agent_address}</dd>
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
                            <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        className="prose prose-sm max-w-none"
                                        components={{
                                          // Simplified markdown components focused on inline formatting
                                          pre: ({children}) => <>{children}</>,
                                          code: ({node, inline, className, children, ...props}) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const language = match ? match[1] : '';
                                            
                                            return inline ? (
                                              <code
                                                className="px-1 py-0.5 rounded bg-gray-100 text-gray-800 text-xs"
                                                {...props}
                                              >
                                                {children}
                                              </code>
                                            ) : (
                                              <div className="my-2">
                                                <SyntaxHighlighter
                                                  language={language}
                                                  style={oneLight}
                                                  customStyle={{
                                                    backgroundColor: '#f8fafc',
                                                    padding: '0.5rem',
                                                    borderRadius: '0.25rem',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '0.75rem',
                                                  }}
                                                >
                                                  {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                              </div>
                                            );
                                          },
                                          // Override default paragraph to prevent extra margins
                                          p: ({children}) => <p className="m-0">{children}</p>,
                                          // Keep links working
                                          a: ({node, href, children, ...props}) => (
                                            <a 
                                              href={href}
                                              className="text-blue-600 hover:underline"
                                              onClick={(e) => e.stopPropagation()}
                                              {...props}
                                            >
                                              {children}
                                            </a>
                                          ),
                                          // Ensure lists don't break layout
                                          ul: ({children}) => <ul className="list-disc pl-4 my-1">{children}</ul>,
                                          ol: ({children}) => <ol className="list-decimal pl-4 my-1">{children}</ol>,
                                          li: ({children}) => <li className="my-0.5">{children}</li>,
                                        }}
                                      >
                                        {character.description}
                                      </ReactMarkdown>
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
          </>
        ) : (
          <>
          </>
        )}
        
        {activeTab === 'memories' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Agent Memories</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Explore memories formed by this agent through interactions
              </p>
            </div>
            
            {/* Memory search component */}
            <div className="px-4 py-4 border-b border-gray-200">
              <form onSubmit={handleAddressSearch} className="flex">
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => handleSearchAddressChange(e.target.value)}
                  placeholder="Enter an address to view memories about them"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchAddress}
                  className={`px-4 py-2 rounded-r-md font-medium text-white ${
                    isSearching || !searchAddress
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSearching ? 
                    <span className="flex items-center">
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Searching...
                    </span> : 
                    'Search'
                  }
                </button>
              </form>
            </div>
        
            {/* Memory sections */}
            <div className="divide-y divide-gray-200">
              {/* Self memories section */}
              <div className="px-4 py-5">
                <h4 className="text-md font-medium text-gray-900 mb-3">Agent's Self-Memories</h4>
                
                {isLoadingSelfMemories ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : selfMemories.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">This agent hasn't formed any self memories yet.</p>
                ) : (
                  <MemoryBrowser memories={selfMemories} />
                )}
              </div>
        
              {/* Current user memories section */}
              <div className="px-4 py-5">
                <h4 className="text-md font-medium text-gray-900 mb-3">Memories About You</h4>
                
                {isLoadingUserMemories ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : userMemories.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    This agent hasn't formed any memories about you yet.
                    Interact with the agent to create memories.
                  </p>
                ) : (
                  <MemoryBrowser memories={userMemories} />
                )}
              </div>
        
              {/* Search results section - only show if we've performed a search */}
              {searchAddress && (
                <div className="px-4 py-5">
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Memories About Address: <span className="font-mono text-sm">{searchAddress}</span>
                  </h4>
                  
                  {searchResults.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No memories found for this address.
                    </p>
                  ) : (
                    <MemoryBrowser memories={searchResults} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Agent interactions would go here - keep this section the same */}
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