import { Agent } from '../types/agent';
import { AgentCard } from './AgentCard';

interface AgentListProps {
  agents: Agent[];
  onAgentClick?: (agentId: string) => void;
}

export function AgentList({ agents, onAgentClick }: AgentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard 
          key={agent.id.toString()} 
          agent={agent} 
          onClick={() => onAgentClick?.(agent.id.toString())} 
        />
      ))}
    </div>
  );
}
