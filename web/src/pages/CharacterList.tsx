import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useNetworkVariable } from '../hooks/useNetworkVariable';
import { useRoochClient, useCurrentSession, SessionKeyGuard, useRoochClientQuery, useCurrentWallet } from '@roochnetwork/rooch-sdk-kit';
import { Transaction, Args } from '@roochnetwork/rooch-sdk';

// Define Character type
interface Character {
  id: string;
  name: string;
  username: string;
  description: string;
}

export function CharacterList() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingAgent, setCreatingAgent] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const packageId = useNetworkVariable('packageId');
  const client = useRoochClient();
  const wallet = useCurrentWallet();
  const session = useCurrentSession();
  
  // Query to fetch character objects owned by the current user
  const { data: charactersResponse, isLoading: isCharactersLoading, error: charactersError } = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        object_type_with_owner: {
          object_type: `${packageId}::character::Character`,
          owner: wallet?.wallet?.getBitcoinAddress().toStr(),
        },
      },
    },
    {
      enabled: !!client && !!packageId && !!wallet?.wallet,
      refetchInterval: 10000,
      refetchOnWindowFocus: true,
    }
  );
  
  // Process the character data when it's available
  useEffect(() => {
    if (isCharactersLoading) {
      setLoading(true);
      return;
    }
    
    if (charactersError) {
      console.error('Failed to fetch characters:', charactersError);
      setError('Failed to load characters. Please try again later.');
      setLoading(false);
      return;
    }
    
    if (charactersResponse?.data) {
      try {
        // Transform the character objects
        const parsedCharacters = charactersResponse.data.map(obj => {
          const characterData = obj.decoded_value?.value || {};
          
          return {
            id: obj.id,
            name: characterData.name || 'Unnamed Character',
            username: characterData.username || 'unnamed',
            description: characterData.description || 'No description available',
          };
        });
        
        setCharacters(parsedCharacters);
      } catch (err) {
        console.error('Failed to parse characters:', err);
        setError('Error parsing character data. Please try again.');
      }
    } else {
      setCharacters([]);
    }
    
    setLoading(false);
  }, [charactersResponse, isCharactersLoading, charactersError]);
  
  // Create AI Agent
  const handleCreateAgent = async (characterId: string) => {
    if (!client || !packageId || !session) {
      setError('Wallet connection required');
      return;
    }
    
    try {
      setCreatingAgent(characterId);
      setError(null);
      
      // Create Agent
      const agentTx = new Transaction();
      agentTx.callFunction({
        target: `${packageId}::agent_entry::create_agent`,
        args: [Args.objectId(characterId)],
      });
      
      agentTx.setMaxGas(5_00000000);
      
      const agentResult = await client.signAndExecuteTransaction({
        transaction: agentTx,
        signer: session,
      });
      
      if (agentResult.execution_info.status.type !== 'executed') {
        console.error('Agent creation failed:', agentResult.execution_info);
        throw new Error(`Agent creation failed: ${JSON.stringify(agentResult.execution_info.status)}`);
      }
      
      // Find Agent object
      const agentChange = agentResult.output?.changeset.changes.find(
        change => change.metadata.object_type.endsWith('::agent::Agent')
      );
      
      if (!agentChange?.metadata.id) {
        console.log('Agent created successfully, but could not find Agent ID');
      } else {
        console.log('Created agent with ID:', agentChange.metadata.id);
      }
      
      // Navigate to home page
      navigate('/');
    } catch (err) {
      console.error('Failed to create agent:', err);
      setError(`Failed to create agent: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCreatingAgent(null);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My AI Characters</h1>
            <p className="text-gray-600">Select a character to launch an AI Agent</p>
          </div>
          <button
            onClick={() => navigate('/create-character')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Character
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : characters.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't created any AI characters yet</p>
            <button
              onClick={() => navigate('/create-character')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Your First Character
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{character.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">@{character.username}</p>
                  <p className="text-gray-700 mb-6 line-clamp-3">{character.description}</p>
                  <div className="flex justify-end">
                    <SessionKeyGuard onClick={() => handleCreateAgent(character.id)}>
                      <button
                        disabled={creatingAgent === character.id}
                        className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                          creatingAgent === character.id ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {creatingAgent === character.id ? 'Launching...' : 'Launch AI Agent'}
                      </button>
                    </SessionKeyGuard>
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