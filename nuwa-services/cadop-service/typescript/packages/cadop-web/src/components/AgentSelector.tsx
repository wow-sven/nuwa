import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import {
  SpinnerContainer,
} from '@/components/ui';
import { useAuth } from '../lib/auth/AuthContext';
import { UserStore } from '../lib/storage';

interface AgentSelectorProps {
  onSelect: (did: string) => void;
  /**
   * Whether to automatically select the first agent in the list when the component mounts.
   * Defaults to true. Pass false if you want the user to make an explicit choice each time.
   */
  autoSelectFirst?: boolean;
}

export function AgentSelector({ onSelect, autoSelectFirst = true }: AgentSelectorProps) {
  const { userDid } = useAuth();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | undefined>();

  useEffect(() => {
    if (userDid) {
      loadAgents();
    }
  }, [userDid]);

  const loadAgents = async () => {
    if (!userDid) return;

    setLoading(true);
    try {
      // Get agent DIDs from local storage
      const agentDids = UserStore.listAgents(userDid);
      setAgents(agentDids || []);

      if (agentDids && agentDids.length > 0) {
        if (autoSelectFirst) {
          // Auto-select the first agent to reduce one user action
          setSelected(agentDids[0]);
          onSelect(agentDids[0]);
        } else {
          setSelected(undefined);
        }
      } else {
        setSelected(undefined);
      }
    } catch (error) {
      console.error('Failed to load agents from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (did: string) => {
    setSelected(did);
    onSelect(did);
  };

  if (loading) {
    return <SpinnerContainer loading={true} />;
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No agent DIDs found</p>
        <p className="text-sm mt-1">Create an agent first to continue</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agents.map(agent => (
        <button
          key={agent}
          onClick={() => handleSelect(agent)}
          className={`
            w-full p-4 text-left rounded-lg border transition-all duration-200
            hover:border-primary-300 hover:bg-primary-50
            ${selected === agent 
              ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' 
              : 'border-gray-200 bg-white'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                Agent DID
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {agent.slice(0, 20)}...{agent.slice(-10)}
              </div>
            </div>
            {selected === agent && (
              <Check className="ml-3 h-5 w-5 text-primary-600 flex-shrink-0" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
