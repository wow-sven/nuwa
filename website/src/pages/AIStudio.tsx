import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BeakerIcon, ChatBubbleLeftIcon, UserCircleIcon, ChevronUpIcon, ChevronDownIcon, PlusIcon, PencilIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { mockAICharacters } from '../mocks/ai'

interface AI {
    id: string
    name: string
    avatar: string
    description: string
    type: string
    prompt: string
}

const AI_TYPES = [
    { id: 'assistant', name: 'AI Assistant' },
    { id: 'agent', name: 'AI Agent' },
    { id: 'npc', name: 'Game NPC' },
]

export function AIStudio() {
    const navigate = useNavigate()
    const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(true)
    const [activeTab, setActiveTab] = useState<'draft' | 'sandbox' | 'launched'>('draft')
    const [formData, setFormData] = useState({
        avatar: '',
        name: '',
        username: '',
        type: 'assistant',
        description: '',
        prompt: ''
    })

    // Mock data for different AI states
    const draftAIs: AI[] = [
        {
            id: 'draft-1',
            name: 'New Assistant',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=draft1',
            description: 'A new AI assistant in development',
            type: 'AI Assistant',
            prompt: 'You are a helpful AI assistant in development.'
        },
        {
            id: 'draft-2',
            name: 'Game Character Draft',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=draft2',
            description: 'A game character being developed',
            type: 'Game NPC',
            prompt: 'You are a game character in development.'
        }
    ]

    const sandboxAIs: AI[] = [
        {
            id: 'sandbox-1',
            name: 'Test Assistant',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sandbox1',
            description: 'A test AI assistant in sandbox environment',
            type: 'AI Assistant',
            prompt: 'You are a helpful AI assistant.'
        },
        {
            id: 'sandbox-2',
            name: 'Game NPC Beta',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sandbox2',
            description: 'A game NPC being tested in sandbox',
            type: 'Game NPC',
            prompt: 'You are a friendly game NPC.'
        }
    ]

    const launchedAIs: AI[] = [
        {
            id: 'launched-1',
            name: 'Production Assistant',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=launched1',
            description: 'A fully launched AI assistant',
            type: 'AI Assistant',
            prompt: 'You are a professional AI assistant.'
        },
        {
            id: 'launched-2',
            name: 'Live Game NPC',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=launched2',
            description: 'A live game NPC in production',
            type: 'Game NPC',
            prompt: 'You are a live game character.'
        }
    ]

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

    const handleUnlaunch = (id: string) => {
        console.log('Unlaunching AI:', id)
        // TODO: Unlaunch AI
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

                {/* AI Panel */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-6">
                    <div className="border-b border-gray-200 dark:border-gray-800">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('draft')}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'draft'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Draft AIs
                            </button>
                            <button
                                onClick={() => setActiveTab('sandbox')}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sandbox'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Sandbox
                            </button>
                            <button
                                onClick={() => setActiveTab('launched')}
                                className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'launched'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Launched AIs
                            </button>
                        </nav>
                    </div>

                    <div className="mt-6">
                        {activeTab === 'draft' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Draft AI cards */}
                                {draftAIs.map((ai) => (
                                    <div key={ai.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <img src={ai.avatar} alt={ai.name} className="w-12 h-12 rounded-full bg-gray-100" />
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
                                                className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700"
                                            >
                                                <BeakerIcon className="w-5 h-5" />
                                                <span>Test</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'sandbox' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Sandbox AI cards */}
                                {sandboxAIs.map((ai) => (
                                    <div key={ai.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <img src={ai.avatar} alt={ai.name} className="w-12 h-12 rounded-full bg-gray-100" />
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
                                ))}
                            </div>
                        )}

                        {activeTab === 'launched' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Launched AI cards */}
                                {launchedAIs.map((ai) => (
                                    <div key={ai.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <img src={ai.avatar} alt={ai.name} className="w-12 h-12 rounded-full bg-gray-100" />
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
                                                onClick={() => navigate(`/agent/${ai.id}`)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                                            >
                                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                                <span>Chat</span>
                                            </button>
                                            <button
                                                onClick={() => handleUnlaunch(ai.id)}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
                                            >
                                                <ArrowDownIcon className="w-5 h-5" />
                                                <span>Unlaunch</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
} 