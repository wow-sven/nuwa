import { Channel } from '../types/channel';
import { formatTimestamp } from '../utils/time';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface ChannelListProps {
  channels: Channel[];
  onChannelClick: (channel: Channel) => void;
}

export function ChannelList({ channels, onChannelClick }: ChannelListProps) {
  return (
    <div className="space-y-2">
      {channels.map((channel) => {
        const lastActiveTime = formatTimestamp(channel.last_active);
        
        return (
          <div 
            key={channel.id.toString()} 
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer"
            onClick={() => onChannelClick(channel)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{channel.title}</h3>
                  <p className="text-sm text-gray-500">
                    {channel.message_counter} messages • Last active: {lastActiveTime}
                  </p>
                </div>
              </div>
              
              {channel.last_message && (
                <div className="hidden sm:block max-w-xs truncate text-sm text-gray-500">
                  {channel.last_message.content}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
