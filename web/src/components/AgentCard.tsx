import { Agent } from '../types/agent';
import { formatTimestamp } from '../utils/time';
import { UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { shortenAddress } from '../utils/address';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
            {agent.character.name}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{agent.character.name}</h3>
            <p className="text-sm text-gray-500">@{agent.character.username}</p>
          </div>
        </div>
        
        {/* Replace plain text with ReactMarkdown */}
        <div className="text-gray-700 line-clamp-2 mb-4">
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
            {agent.character.description}
          </ReactMarkdown>
        </div>
        
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
