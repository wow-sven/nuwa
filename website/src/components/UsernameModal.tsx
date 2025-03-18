import { useState } from 'react'

interface UsernameModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (username: string) => void
}

export function UsernameModal({ isOpen, onClose, onSubmit }: UsernameModalProps) {
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!username.trim()) {
            setError('用户名不能为空')
            return
        }
        setError('')
        onSubmit(username.trim())
        setUsername('')
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
        if (error) {
            setError('')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    设置用户名
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            value={username}
                            onChange={handleInputChange}
                            placeholder="请输入用户名"
                            className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-purple-500'}`}
                            required
                        />
                        {error && (
                            <p className="mt-1 text-sm text-red-500">
                                {error}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!username.trim()}
                        >
                            确认
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 