import { Agent } from '../types/agent';
import { formatTimestamp } from '../utils/time';
import { UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { shortenAddress } from '../utils/address';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const lastActive = formatTimestamp(agent.lastActiveTimestamp);

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
            {agent.character.name[0]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{agent.character.name}</h3>
            <p className="text-sm text-gray-500">@{agent.character.username}</p>
          </div>
        </div>
        
        <p className="text-gray-700 line-clamp-2 mb-4">{agent.character.description}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <UserCircleIcon className="h-4 w-4" />
            <span>{shortenAddress(agent.address)}</span>
          </div>
          <div>Last active: {lastActive}</div>
        </div>
      </div>
      
      {agent.homeChannelId && (
        <div className="border-t border-gray-100 p-3">
          <Link 
            to={`/chat/${agent.homeChannelId}`}
            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            <span>Chat with {agent.character.name}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
