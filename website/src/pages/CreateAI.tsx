import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Task, TaskArgument } from '../types/task'

const AI_TYPES = [
    { id: 'assistant', name: 'AI Assistant' },
    { id: 'agent', name: 'AI Agent' },
    { id: 'npc', name: 'Game NPC' },
]

interface Task {
    id: string
    name: string
    description: string
    prompt: string
}

export function CreateAI() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        avatar: '',
        name: '',
        username: '',
        type: 'assistant',
        description: '',
        prompt: ''
    })
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState<Task>({
        id: '',
        name: '',
        description: '',
        arguments: [],
        resolverAddress: '',
        isOnChain: false,
        price: 0
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', { ...formData, tasks })
        // TODO: Handle form submission
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setNewTask(prev => ({
            ...prev,
            [name]: name === 'price' ? Number(value) :
                name === 'isOnChain' ? (e.target as HTMLInputElement).checked :
                    value
        }))
    }

    const handleAddArgument = () => {
        setNewTask(prev => ({
            ...prev,
            arguments: [...prev.arguments, { name: '', type: 'String', description: '' }]
        }))
    }

    const handleRemoveArgument = (index: number) => {
        setNewTask(prev => ({
            ...prev,
            arguments: prev.arguments.filter((_, i) => i !== index)
        }))
    }

    const handleArgumentChange = (index: number, field: keyof TaskArgument, value: string) => {
        setNewTask(prev => ({
            ...prev,
            arguments: prev.arguments.map((arg, i) =>
                i === index ? { ...arg, [field]: value } : arg
            )
        }))
    }

    const handleAddTask = () => {
        if (newTask.name && newTask.description) {
            setTasks(prev => [...prev, { ...newTask, id: Date.now().toString() }])
            setNewTask({
                id: '',
                name: '',
                description: '',
                arguments: [],
                resolverAddress: '',
                isOnChain: false,
                price: 0
            })
        }
    }

    const handleRemoveTask = (taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId))
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/studio')}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Studio</span>
                </button>

                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create New AI</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Configure your AI agent's profile and behavior</p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info Section */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Avatar URL
                                    </label>
                                    <input
                                        type="text"
                                        name="avatar"
                                        value={formData.avatar}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        {AI_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Base Prompt
                                </label>
                                <textarea
                                    name="prompt"
                                    value={formData.prompt}
                                    onChange={handleInputChange}
                                    rows={5}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter the base prompt that defines your AI's personality and behavior..."
                                />
                            </div>
                        </div>

                        {/* Tasks Section */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Tasks</h2>

                            {/* Task List */}
                            <div className="space-y-4 mb-6">
                                {tasks.map(task => (
                                    <div key={task.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.name}</h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTask(task.id)}
                                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Prompt:</p>
                                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{task.prompt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add New Task */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Add New Task</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Task Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newTask.name}
                                            onChange={handleTaskInputChange}
                                            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                                            placeholder="Enter task name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={newTask.description}
                                            onChange={handleTaskInputChange}
                                            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                                            placeholder="Enter task description"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Arguments
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleAddArgument}
                                                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                                            >
                                                + Add Argument
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {newTask.arguments.map((arg, index) => (
                                                <div key={index} className="flex items-start space-x-3">
                                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                                        <input
                                                            type="text"
                                                            value={arg.name}
                                                            onChange={e => handleArgumentChange(index, 'name', e.target.value)}
                                                            className="p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                                                            placeholder="Name"
                                                        />
                                                        <select
                                                            value={arg.type}
                                                            onChange={e => handleArgumentChange(index, 'type', e.target.value)}
                                                            className="p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                                                        >
                                                            <option value="String">String</option>
                                                            <option value="Number">Number</option>
                                                            <option value="Boolean">Boolean</option>
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={arg.description}
                                                            onChange={e => handleArgumentChange(index, 'description', e.target.value)}
                                                            className="p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                                                            placeholder="Description"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveArgument(index)}
                                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Resolver Address
                                        </label>
                                        <input
                                            type="text"
                                            name="resolverAddress"
                                            value={newTask.resolverAddress}
                                            onChange={handleTaskInputChange}
                                            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                                            placeholder="Enter resolver address"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isOnChain"
                                            name="isOnChain"
                                            checked={newTask.isOnChain}
                                            onChange={handleTaskInputChange}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <label
                                            htmlFor="isOnChain"
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            On-Chain Task
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Price (RGAS)
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newTask.price}
                                            onChange={handleTaskInputChange}
                                            className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 bg-transparent"
                                            placeholder="Enter price in RGAS"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddTask}
                                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        <span>Add Task</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/studio')}
                                className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-purple-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                Save as Draft
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
} 