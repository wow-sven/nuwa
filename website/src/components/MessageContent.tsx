interface MessageContentProps {
  content: string
  onTopicClick?: (topicId: string) => void
}

export function MessageContent({ content, onTopicClick }: MessageContentProps) {
  // Split content by topic mentions (#number)
  const parts = content.split(/(#\d+)/g)

  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, index) => {
        // Check if part matches topic mention pattern
        const topicMatch = part.match(/^#(\d+)$/)
        
        if (topicMatch && onTopicClick) {
          const topicId = topicMatch[1]
          return (
            <button
              key={index}
              onClick={() => onTopicClick(topicId)}
              className="text-purple-600 dark:text-purple-400 hover:underline focus:outline-none"
            >
              {part}
            </button>
          )
        }
        
        return <span key={index}>{part}</span>
      })}
    </span>
  )
} 