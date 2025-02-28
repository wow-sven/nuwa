import { useState } from 'react';
import { Memory, MemoryContext, MemoryContexts } from '../types/agent';
import { formatTimestamp } from '../utils/time';

interface MemoryBrowserProps {
  memories: Memory[];
}

export function MemoryBrowser({ memories }: MemoryBrowserProps) {
  const [selectedContext, setSelectedContext] = useState<MemoryContext | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filter memories by context and search term
  const filteredMemories = memories.filter(memory => {
    return (
      (selectedContext === 'all' || memory.context === selectedContext) &&
      (searchTerm === '' || memory.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  // Sort memories by timestamp
  const sortedMemories = [...filteredMemories].sort((a, b) => {
    return sortOrder === 'newest' 
      ? b.timestamp - a.timestamp 
      : a.timestamp - b.timestamp;
  });

  // Count memories by context for the filter dropdown
  const memoryCounts = MemoryContexts.reduce((acc, context) => {
    acc[context] = memories.filter(m => m.context === context).length;
    return acc;
  }, {} as Record<string, number>);

  const getContextColor = (context: string): string => {
    switch (context) {
      case 'personal': return 'bg-blue-100 text-blue-800';
      case 'interaction': return 'bg-green-100 text-green-800';
      case 'knowledge': return 'bg-purple-100 text-purple-800';
      case 'emotional': return 'bg-red-100 text-red-800';
      case 'goal': return 'bg-yellow-100 text-yellow-800';
      case 'preference': return 'bg-indigo-100 text-indigo-800';
      case 'feedback': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search memories..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedContext}
            onChange={(e) => setSelectedContext(e.target.value as MemoryContext | 'all')}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All contexts ({memories.length})</option>
            {MemoryContexts.map((context) => (
              <option key={context} value={context}>
                {context} ({memoryCounts[context] || 0})
              </option>
            ))}
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {sortedMemories.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No memories found matching your criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMemories.map((memory) => (
            <div 
              key={memory.index} 
              className="p-4 bg-white border border-gray-200 rounded-md shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span 
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getContextColor(memory.context)}`}
                >
                  {memory.context}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(memory.timestamp)}
                </span>
              </div>
              <p className="mt-2 text-gray-700">{memory.content}</p>
              <div className="mt-2 text-xs text-gray-500">
                Memory #{memory.index}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
