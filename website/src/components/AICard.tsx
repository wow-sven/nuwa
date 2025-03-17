import { Agent } from '../types/agent'
import { useNavigate } from 'react-router-dom'

interface AICardProps {
  ai: Agent
}

export function AICard({ ai }: AICardProps) {
  const navigate = useNavigate()

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
      onClick={() => navigate(`/agent/${ai.agentname}`)}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <img
            src={ai.avatar}
            alt={ai.name}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {ai.name}
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              @{ai.agentname}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {ai.description}
            </p>
            <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {ai.stats.members.toLocaleString()} members
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
} 