import { useState, useEffect } from 'react';
import { useNetworkVariable } from '../hooks/useNetworkVariable';
import { useRoochClient, useCurrentSession } from '@roochnetwork/rooch-sdk-kit';
import { Channel } from '../types/channel';

interface ChannelListContainerProps {
  onChannelClick: (channel: Channel) => void;
}

export const ChannelListContainer = ({ onChannelClick }: ChannelListContainerProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const packageId = useNetworkVariable('packageId');
  const client = useRoochClient();
  const session = useCurrentSession();

  useEffect(() => {
    const fetchChannels = async () => {
      if (!client || !packageId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Example: fetch channels from the Move contract
        // Adjust this based on your actual contract function
        const response = await client.view({
          function: `${packageId}::channel::get_channels`,
          typeArguments: [],
          functionArguments: [],
        });
        
        // Parse the response based on your contract's return structure
        const channelData = response.data;
        
        // Transform data to Channel type
        const formattedChannels: Channel[] = Array.isArray(channelData) 
          ? channelData.map((item: any) => ({
              id: item.id,
              name: item.name || 'Unnamed Channel',
              description: item.description || '',
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            }))
          : [];
          
        setChannels(formattedChannels);
      } catch (err) {
        console.error('Failed to fetch channels:', err);
        setError('Failed to load channels. Please try again.');
        
        // For demo purposes, add some mock channels if fetch fails
        setChannels([
          { id: 'demo-1', name: 'General Chat', description: 'For general discussions' },
          { id: 'demo-2', name: 'Technical Support', description: 'Get help with technical issues' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [client, packageId]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading channels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No channels found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {channels.map((channel) => (
        <div 
          key={channel.id}
          className="p-3 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => onChannelClick(channel)}
        >
          <h3 className="font-medium">{channel.name}</h3>
          {channel.description && (
            <p className="text-sm text-gray-500 truncate">{channel.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};