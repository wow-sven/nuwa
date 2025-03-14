import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BeakerIcon, ChatBubbleLeftIcon, UserCircleIcon, ChevronUpIcon, ChevronDownIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import { mockAICharacters } from '../mocks/ai'

const AI_TYPES = [
    { id: 'assistant', name: 'AI Assistant' },
    { id: 'agent', name: 'AI Agent' },
    { id: 'npc', name: 'Game NPC' },
]

export function AIStudio() {
    const navigate = useNavigate()
    const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(true)
    const [activeTab, setActiveTab] = useState<'draft' | 'launched'>('draft')
    const [formData, setFormData] = useState({
        avatar: '',
        name: '',
        username: '',
        type: 'assistant',
        description: '',
        prompt: ''
    })

    // Mock data: draft and launched AIs
    const draftAIs = mockAICharacters.slice(0, 2).map(ai => ({ ...ai, status: 'draft' }))
    const launchedAIs = mockAICharacters.slice(2).map(ai => ({ ...ai, status: 'launched' }))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        // TODO: Handle form submission
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleTest = (id: string) => {
        console.log('Testing AI:', id)
        // TODO: Test AI in sandbox
    }

    const handleLaunch = (id: string) => {
        console.log('Launching AI:', id)
        // TODO: Launch AI
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Title */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Studio</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create, test, and manage your AI agents</p>
                    </div>
                    <button
                        onClick={() => navigate('/studio/create')}
                        className="flex items-center space-x-2 bg-purple-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Create New AI</span>
                    </button>
                </div>

                {/* AI List Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    {/* Tabs */}
                    <div className="px-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('draft')}
                                className={`relative px-8 py-4 text-sm font-medium rounded-t-lg transition-all duration-200 ${activeTab === 'draft'
                                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-[0_4px_10px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_10px_-1px_rgba(0,0,0,0.3)] z-10'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Draft AIs
                                {activeTab === 'draft' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('launched')}
                                className={`relative px-8 py-4 text-sm font-medium rounded-t-lg transition-all duration-200 ${activeTab === 'launched'
                                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-[0_4px_10px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_10px_-1px_rgba(0,0,0,0.3)] z-10'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Launched AIs
                                {activeTab === 'launched' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTab === 'draft' ? (
                                draftAIs.map(ai => (
                                    <div key={ai.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <img src={ai.avatar} alt={ai.name} className="w-12 h-12 rounded-full" />
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{ai.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{ai.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/studio/edit/${ai.id}`)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleTest(ai.id)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                <BeakerIcon className="w-5 h-5" />
                                                <span>Test</span>
                                            </button>
                                            <button
                                                onClick={() => handleLaunch(ai.id)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700"
                                            >
                                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                                <span>Launch</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                launchedAIs.map(ai => (
                                    <div key={ai.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <img src={ai.avatar} alt={ai.name} className="w-12 h-12 rounded-full" />
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{ai.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{ai.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/agent/${ai.id}`)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                                <span>Chat</span>
                                            </button>
                                            <button
                                                onClick={() => navigate(`/agent/${ai.id}/profile`)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                <UserCircleIcon className="w-5 h-5" />
                                                <span>Profile</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 