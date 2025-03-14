import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Chat } from '../components/Chat'
import { Message, Topic } from '../types/chat'
import { Agent } from '../types/agent'
import { PlusIcon, ChatBubbleLeftIcon, UserCircleIcon, UserGroupIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { mockMessages, mockTopics, mockMembers } from '../mocks/chat'
import type { ChatMember } from '../mocks/chat'

export function AgentChat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [topics, setTopics] = useState<Topic[]>(mockTopics)
  const [members] = useState<ChatMember[]>(mockMembers)
  const [inputMessage, setInputMessage] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(mockTopics[0])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'User',
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')

    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a mock response for agent ${id}. You said: ${inputMessage}. You can reference topics like #1 or #2.`,
        sender: 'Nuwa AI',
        timestamp: new Date().toISOString(),
        type: 'text'
      }
      setMessages(prev => [...prev, assistantMessage])

      // Update topic's last message
      setTopics(prev => prev.map(topic =>
        topic.id === selectedTopic?.id
          ? {
            ...topic,
            lastMessage: inputMessage,
            timestamp: new Date().toISOString(),
            unread: topic.unread + 1
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
      lastMessage: '',
      timestamp: new Date().toISOString(),
      unread: 0
    }

    setTopics(prev => [...prev, newTopic])
    setSelectedTopic(newTopic)
    setMessages([]) // Clear messages when switching to new topic
    setIsCreatingTopic(false)
    setNewTopicTitle('')
  }

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopic(topics.find(t => t.id === topicId) || null)
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dialog List</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          {topics.map(topic => (
            <div
              key={topic.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedTopic?.id === topic.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              onClick={() => handleSelectTopic(topic.id)}
            >
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {topic.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {topic.lastMessage}
                  </p>
                </div>
                {topic.unread > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-purple-600 rounded-full">
                    {topic.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {selectedTopic?.title}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'User' ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${message.sender === 'User'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Agent Profile & Members List */}
      <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        {/* Agent Profile Section */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=1"
              alt="AI Avatar"
              className="w-16 h-16 rounded-full"
            />
            <div className="mt-2 text-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Task Helper
              </h2>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                @task_helper
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">1.2k</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Members</div>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">$2.5</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">$3M</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">MCap</div>
            </div>
          </div>

          {/* Profile Button */}
          <button
            onClick={() => navigate(`/agent/${id}/profile`)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 mt-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
          >
            <UserCircleIcon className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </button>
        </div>

        {/* Members List Section */}
        <div className="p-3 flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
          <UserGroupIcon className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Members</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-20rem)]">
          {members.map(member => (
            <div
              key={member.id}
              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {member.balance} RGAS
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 