import { useNavigate } from 'react-router-dom'
import { ChatBubbleLeftIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline'
import { mockAgents } from '../mocks/agent'

export function AIStudio() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Title */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Studio</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create, test, and manage your AI agents</p>
                    </div>
                    <button
                        onClick={() => navigate('/studio/create')}
                        className="flex items-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>New Agent</span>
                    </button>
                </div>

                {/* Agents Panel */}
                <div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockAgents.map((agent) => (
                                <div key={agent.agentname} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative flex flex-col min-h-[200px]">
                                    <button
                                        onClick={() => navigate(`/agent/${agent.agentname}`)}
                                        className="absolute top-3 right-3 flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                        title="Chat"
                                    >
                                        <ChatBubbleLeftIcon className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <img src={agent.avatar} alt={agent.name} className="w-12 h-12 rounded-full bg-gray-100" />
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{agent.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">@{agent.agentname}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{agent.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 mt-auto">
                                        <button
                                            onClick={() => navigate(`/profile/${agent.agentname}`)}
                                            className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                            <span>Profile</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 