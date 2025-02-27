import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useNetworkVariable } from '../hooks/useNetworkVariable';
import { useRoochClient, useCurrentSession, WalletGuard } from '@roochnetwork/rooch-sdk-kit';
import { Transaction, Args } from '@roochnetwork/rooch-sdk';

export function CreateAgent() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const packageId = useNetworkVariable('packageId');
  const client = useRoochClient();
  const session = useCurrentSession();
  
  const handleSubmit = async () => {
    if (!name.trim() || !username.trim()) {
      setError('Agent name and username are required');
      return;
    }
    
    if (!client || !packageId || !session) {
      setError('Wallet connection required');
      return;
    }
    
    try {
      setIsCreating(true);
      setError(null);
      
      // Step 1: Create a Character object
      const characterTx = new Transaction();
      characterTx.callFunction({
        target: `${packageId}::character::create_character_entry`,
        args: [
          Args.string(name), 
          Args.string(username), 
          Args.string(description || `${name} is an autonomous AI entity with unique perspectives and capabilities.`)
        ],
      });
      
      characterTx.setMaxGas(5_00000000);
      
      const characterResult = await client.signAndExecuteTransaction({
        transaction: characterTx,
        signer: session,
      });
      
      if (characterResult.execution_info.status.type !== 'executed') {
        console.error('Character creation failed:', characterResult.execution_info);
        throw new Error(`Character creation failed: ${JSON.stringify(characterResult.execution_info.status)}`);
      }
      
      // Find the Character object from changeset
      const characterChange = characterResult.output?.changeset.changes.find(
        change => change.metadata.object_type.endsWith('::character::Character')
      );
      
      if (!characterChange?.metadata.id) {
        throw new Error('Failed to get character ID from transaction result');
      }
      
      const characterObjectId = characterChange.metadata.id;
      console.log('Created character with ID:', characterObjectId);
      
      // Step 2: Create an Agent using the Character object
      const agentTx = new Transaction();
      agentTx.callFunction({
        target: `${packageId}::agent_entry::create_agent`,
        args: [Args.objectId(characterObjectId)],
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
      
      // Find the Agent object from changeset
      const agentChange = agentResult.output?.changeset.changes.find(
        change => change.metadata.object_type.endsWith('::agent::Agent')
      );
      
      if (!agentChange?.metadata.id) {
        console.log('Agent created successfully, but could not find Agent ID');
      } else {
        console.log('Created agent with ID:', agentChange.metadata.id);
      }
      
      // Navigate to the home page after successful creation
      navigate('/');
    } catch (err) {
      console.error('Failed to create agent:', err);
      setError(`Failed to create agent: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New AI Agent</h1>
          <p className="text-gray-600">Configure your new onchain AI Agent</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name*
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Aria"
              required
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username*
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., aria"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what this agent does and its personality..."
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <WalletGuard onClick={handleSubmit}>
              <button
                type="button"
                disabled={isCreating}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isCreating ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isCreating ? 'Creating...' : 'Create Agent'}
              </button>
            </WalletGuard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
