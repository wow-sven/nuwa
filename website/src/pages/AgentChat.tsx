import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Chat } from '../components/Chat'
import { Message, Topic } from '../types/chat'
import { Agent } from '../types/agent'
import { PlusIcon, ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline'

export function AgentChat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      title: 'Getting Started',
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messageCount: 3
    }
  ])
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>('1')
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')

  const handleSendMessage = async (content: string) => {
    if (!selectedTopicId) return
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a mock response for agent ${id}. You said: ${content}. You can reference topics like #1 or #2.`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])

      // Update topic's last message time and message count
      setTopics(prev => prev.map(topic => 
        topic.id === selectedTopicId
          ? { 
              ...topic, 
              lastMessageAt: new Date().toISOString(),
              messageCount: topic.messageCount + 2
            }
          : topic
      ))
    } catch (error) {
      console.error('Failed to get response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim()) return

    const newTopic: Topic = {
      id: Date.now().toString(),
      title: newTopicTitle.trim(),
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messageCount: 0
    }

    setTopics(prev => [...prev, newTopic])
    setSelectedTopicId(newTopic.id)
    setMessages([]) // Clear messages when switching to new topic
    setIsCreatingTopic(false)
    setNewTopicTitle('')
  }

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId)
    setMessages([]) // In real app, we would load messages for the selected topic
  }

  const handleTopicClick = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId)
    if (topic) {
      handleSelectTopic(topicId)
      // Scroll the topic into view in the sidebar
      const topicElement = document.getElementById(`topic-${topicId}`)
      if (topicElement) {
        topicElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  return (
    <main className="h-screen w-full flex overflow-hidden">
      {/* Topics sidebar */}
      <div className="w-64 flex-none border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsCreatingTopic(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Topic
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {topics.map(topic => (
              <button
                key={topic.id}
                id={`topic-${topic.id}`}
                onClick={() => handleSelectTopic(topic.id)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 ${
                  selectedTopicId === topic.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center">
                  <ChatBubbleLeftIcon className="w-5 h-5 mr-2 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">#{topic.id} {topic.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {topic.messageCount} messages
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {isCreatingTopic && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={newTopicTitle}
                onChange={e => setNewTopicTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateTopic()}
                placeholder="Topic title..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-gray-100"
                autoFocus
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={() => setIsCreatingTopic(false)}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTopic}
                  className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedTopicId ? (
          <div className="flex-1 min-h-0">
            <Chat
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onTopicClick={handleTopicClick}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a topic to start chatting
          </div>
        )}
      </div>

      {/* AI Info sidebar */}
      <aside className="w-72 flex-none border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="h-full flex flex-col">
          {/* AI Profile Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=1"
                alt="AI Avatar"
                className="w-16 h-16 rounded-full flex-shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  Task Helper
                </h2>
                <div className="mt-1 flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Online</span>
                </div>
                <div className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                  @task_helper
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-4 grid grid-cols-3 gap-4 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">1.2k</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Members</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">$2.5</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">$3M</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">MC</div>
              </div>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => navigate(`/agent/${id}/profile`)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 mt-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
            >
              <UserCircleIcon className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>
          </div>

          {/* Agent Details - Make this scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  You are an AI agent who helps the developer build custom tasks.
                </p>
              </div>

              {/* Technical Details */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Agent ID</h3>
                  <div className="text-xs text-gray-900 dark:text-gray-100 font-mono break-all bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                    0xb9e4b3c592dabbaf70dbc2e2cad66ebce0a91c2c864c99a8fa801863797893db
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Agent Address</h3>
                  <div className="text-xs text-gray-900 dark:text-gray-100 font-mono break-all bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                    rooch19n5zuqjc7rlcx6zgh3ln5fyateczs8n4des4v28y7gkrt7545a9qppy0rl
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Character ID</h3>
                  <div className="text-xs text-gray-900 dark:text-gray-100 font-mono break-all bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
                    0x0aa7a2ed20a8683404411985f3d9347a17970c5396d5cfb7bf3906a7d2a4d67d
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Model Provider</h3>
                    <div className="text-sm text-gray-900 dark:text-gray-100">gpt-4o</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Active</h3>
                    <div className="text-sm text-gray-900 dark:text-gray-100">3/13/2025, 11:13:19 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  )
} 