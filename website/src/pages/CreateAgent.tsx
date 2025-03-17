import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhotoIcon } from '@heroicons/react/24/outline'

interface CreateAgentForm {
    agentname: string
    name: string
    avatar: string | null
    description: string
    prompt: string
}

export function CreateAgent() {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [form, setForm] = useState<CreateAgentForm>({
        agentname: '',
        name: '',
        avatar: null,
        description: '',
        prompt: ''
    })
    const [errors, setErrors] = useState<Partial<CreateAgentForm>>({})
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user types
        if (errors[name as keyof CreateAgentForm]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }))
        }
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const result = reader.result as string
                setPreviewAvatar(result)
                setForm(prev => ({
                    ...prev,
                    avatar: result
                }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        const newErrors: Partial<CreateAgentForm> = {}
        if (!form.agentname.trim()) {
            newErrors.agentname = 'Username is required'
        }
        if (!form.name.trim()) {
            newErrors.name = 'Display name is required'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // TODO: Submit form to backend
        console.log('Form submitted:', form)

        // Navigate back after successful submission
        navigate(-1)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create Agent</h1>

                        {/* Username */}
                        <div className="mb-6">
                            <label htmlFor="agentname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Username *
                            </label>
                            <input
                                type="text"
                                id="agentname"
                                name="agentname"
                                value={form.agentname}
                                onChange={handleInputChange}
                                className={`block w-full rounded-lg border ${errors.agentname ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="Enter globally unique username"
                            />
                            {errors.agentname && (
                                <p className="mt-1 text-sm text-red-500">{errors.agentname}</p>
                            )}
                        </div>

                        {/* Display Name */}
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Display Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleInputChange}
                                className={`block w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="Enter display name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Avatar */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Avatar
                            </label>
                            <div className="mt-1 flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                                >
                                    {previewAvatar ? (
                                        <img
                                            src={previewAvatar}
                                            alt="Avatar preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Click to upload avatar
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter agent description"
                            />
                        </div>

                        {/* Prompt */}
                        <div className="mb-6">
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Prompt
                            </label>
                            <textarea
                                id="prompt"
                                name="prompt"
                                value={form.prompt}
                                onChange={handleInputChange}
                                rows={5}
                                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                                placeholder="Enter agent prompt"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
} 