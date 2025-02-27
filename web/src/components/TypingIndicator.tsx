interface TypingIndicatorProps {
  name?: string; // Optional name to display
}

export function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 mb-3 max-w-3xl">
      {/* Add avatar for the AI agent */}
      <div className="flex-shrink-0 w-8 h-8">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
          {name ? name.substring(0, 2).toUpperCase() : 'AI'}
        </div>
      </div>
      
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 inline-flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '600ms' }}></div>
        </div>
        <div className="text-sm text-purple-700">
          {name ? `${name} is thinking...` : 'AI is thinking...'}
        </div>
      </div>
    </div>
  );
}