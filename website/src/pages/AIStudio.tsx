import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatBubbleLeftIcon, PlusIcon, PencilIcon, CpuChipIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { mockAgentNames, mockAgents } from '../mocks/agent'
import { AgentName } from '../types/agent'

export function AIStudio() {
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [agentname, setAgentname] = useState('')
    const [error, setError] = useState('')
    const [agentNamesList, setAgentNamesList] = useState<AgentName[]>(mockAgentNames)

    const checkAgentnameExists = (name: string): boolean => {
        const allAgents = [...agentNamesList, ...mockAgents]
        return allAgents.some(agent => agent.agentname.toLowerCase() === name.toLowerCase())
    }

    const handleSubmit = () => {
        if (!agentname.trim()) {
            setError('Please enter an agentname')
            return
        }
        if (checkAgentnameExists(agentname)) {
            setError('This agentname already exists')
            return
        }

        // Add new agent name to the list
        const newAgentName: AgentName = {
            agentname: agentname.trim(),
            registeredAt: new Date().toISOString()
        }
        setAgentNamesList(prev => [...prev, newAgentName])

        // Reset and close modal
        setAgentname('')
        setError('')
        setIsModalOpen(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Title */}
                <div className="mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Studio</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create, test, and manage your AI agents</p>
                    </div>
                </div>

                {/* Agent Names Panel */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Agent Names</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-purple-600 text-white rounded-lg mx-4 px-4 py-1.5 text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>Register Agent Name</span>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Register and manage your unique agent names. Each name represents a distinct AI personality you can create and customize.</p>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {agentNamesList.map((agent) => (
                                <div key={agent.agentname} className="py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">@{agent.agentname}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Registered At: {new Date(agent.registeredAt || Date.now()).toLocaleString('zh-CN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => { }}
                                                className="flex items-center justify-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 transition-colors duration-200"
                                            >
                                                <CpuChipIcon className="w-4 h-4" />
                                                <span>Launch</span>
                                            </button>
                                            <button
                                                onClick={() => { }}
                                                className="flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors duration-200"
                                            >
                                                <ArrowRightIcon className="w-4 h-4" />
                                                <span>Transfer</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Agents Panel */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Agents</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Browse and interact with your created AI agents. Each agent has its own personality and can be customized through its profile.</p>
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
                                            onClick={() => navigate(`/agent/${agent.agentname}/profile`)}
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

                {/* Register Agent Name Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Register New Agent Name</h3>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        setAgentname('')
                                        setError('')
                                    }}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="agentname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Agentname <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="agentname"
                                    value={agentname}
                                    onChange={(e) => {
                                        setAgentname(e.target.value)
                                        setError('')
                                    }}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Agentname is the unique identifier for your agent"
                                />
                                {error && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        setAgentname('')
                                        setError('')
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 