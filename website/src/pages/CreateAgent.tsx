import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { useCreateAgent } from '../hooks/use-agent-create'
import { SessionKeyGuard } from '@roochnetwork/rooch-sdk-kit'
import toast from 'react-hot-toast'
import { SEO } from '../components/layout/SEO'
import useUserNameCheck from '../hooks/use-user-name-check'

interface CreateAgentForm {
    username: string
    name: string
    avatar: string | null
    description: string
    prompt: string
    isPaid: boolean
}

export const CreateAgent = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState<CreateAgentForm>({
        username: '',
        name: '',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=default',
        description: '',
        prompt: '',
        isPaid: false
    })
    const { mutate, isPending } = useCreateAgent()
    const [errors, setErrors] = useState<Partial<CreateAgentForm>>({})
    const [previewAvatar, setPreviewAvatar] = useState<string | null>('https://api.dicebear.com/7.x/bottts/svg?seed=default')
    const [avatarError, setAvatarError] = useState<string | null>(null)
    const [hasCustomAvatar, setHasCustomAvatar] = useState(false)
    const { available: usernameCheck, isPending: isCheckingUsername, refetch: refetchUsername } = useUserNameCheck(form.username)

    const getDefaultAvatar = (username: string) => {
        return `https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'default'}`
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        // Clear error when user types
        if (errors[name as keyof CreateAgentForm]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }))
        }
        // Update default avatar when username changes and no custom avatar is set
        if (name === 'username' && !hasCustomAvatar) {
            const defaultAvatar = getDefaultAvatar(value)
            setPreviewAvatar(defaultAvatar)
            setForm(prev => ({
                ...prev,
                avatar: defaultAvatar
            }))
        }
    }

    const handleAvatarError = () => {
        const defaultAvatar = getDefaultAvatar(form.username)
        setPreviewAvatar(defaultAvatar)
        setAvatarError('Failed to load image. Please check the URL and try again.')
        setForm(prev => ({
            ...prev,
            avatar: defaultAvatar
        }))
        setHasCustomAvatar(false)
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value.trim()
        setAvatarError(null)
        setPreviewAvatar(url)
        setForm(prev => ({
            ...prev,
            avatar: url
        }))
        setHasCustomAvatar(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        const newErrors: Partial<CreateAgentForm> = {}
        if (!form.username.trim()) {
            newErrors.username = 'Username is required'
        }
        if (!form.name.trim()) {
            newErrors.name = 'Display name is required'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Check username availability
        const result = await refetchUsername()
        if (result.data?.error) {
            setErrors(prev => ({
                ...prev,
                username: result.data.error
            }))
            return
        }

        if (!result.data?.isAvailable) {
            setErrors(prev => ({
                ...prev,
                username: 'Username is not available'
            }))
            return
        }

        mutate({
            name: form.name,
            username: form.username,
            avatar: form.avatar!,
            description: form.description,
            instructions: form.prompt
        }, {
            onSuccess: () => {
                navigate(-1)
            },
            onError: (error) => {
                toast.error(error.message)
            }
        })
    }

    return (
        <>
            <SEO
                title="Create Agent"
                description="Create your own AI agent on Nuwa platform. Design and deploy Web3 AI Agents that can manage crypto assets and execute on-chain operations."
                keywords="Create AI Agent, Web3 AI, Autonomous Agent, Crypto Agent, Blockchain AI, Nuwa Agent Creation"
            />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create Agent</h1>

                            {/* Username */}
                            <div className="mb-6">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Username *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={form.username}
                                        onChange={handleInputChange}
                                        className={`block w-full rounded-lg border ${errors.username ? 'border-red-500' : usernameCheck?.isAvailable ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                        placeholder="Enter globally unique username"
                                    />
                                    {isCheckingUsername && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin h-5 w-5 border-2 border-purple-500 rounded-full border-t-transparent"></div>
                                        </div>
                                    )}
                                    {!isCheckingUsername && usernameCheck?.isAvailable && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                                )}
                                {!errors.username && usernameCheck?.isAvailable && (
                                    <p className="mt-1 text-sm text-green-500">Username is available!</p>
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

                            {/* Avatar URL */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Avatar
                                </label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                                        {previewAvatar ? (
                                            <img
                                                src={previewAvatar}
                                                alt="Avatar preview"
                                                className="w-full h-full object-cover"
                                                onError={handleAvatarError}
                                            />
                                        ) : (
                                            <PhotoIcon className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="url"
                                            id="avatarUrl"
                                            name="avatarUrl"
                                            placeholder="Enter the url to your avatar"
                                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            onChange={handleAvatarChange}
                                        />
                                        {avatarError && (
                                            <p className="mt-1 text-sm text-red-500">{avatarError}</p>
                                        )}
                                    </div>
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

                            {/* Paid Option */}
                            <div className="mb-6">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isPaid"
                                        name="isPaid"
                                        checked={form.isPaid}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                        It takes 100 RGAS to create an agent. It will be charged to the agent's account.
                                    </label>
                                </div>
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
                                <SessionKeyGuard onClick={() => { }}>
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${isPending
                                            ? "bg-purple-400 cursor-not-allowed"
                                            : "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                                            }`}
                                    >
                                        {isPending ? (
                                            <svg
                                                className="w-5 h-5 animate-spin mx-auto text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v8H4z"
                                                ></path>
                                            </svg>
                                        ) : (
                                            "Create"
                                        )}
                                    </button>
                                </SessionKeyGuard>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
} 