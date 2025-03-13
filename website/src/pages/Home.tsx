import { useState, useMemo } from 'react'
import { AICard } from '../components/AICard'
import { Hero } from '../components/Hero'
import { CreateAISection } from '../components/CreateAISection'
import { Footer } from '../components/Footer'
import { AICharacter, AICategory, categories, categoryLabels } from '../types/ai'

// Mock data
const mockAIs: AICharacter[] = [
  {
    id: '1',
    name: 'Claude',
    username: 'claude',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Claude',
    category: 'featured',
    followers: 12345,
    walletAddress: '0x21a68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37379',
    description: 'Anthropic\'s helpful AI assistant with advanced reasoning capabilities'
  },
  {
    id: '2',
    name: 'GPT-4',
    username: 'gpt4',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GPT4',
    category: 'featured',
    followers: 23456,
    walletAddress: '0x32b79c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37380',
    description: 'OpenAI\'s most capable model for complex tasks'
  },
  {
    id: '3',
    name: 'DALL-E',
    username: 'dalle',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DALLE',
    category: 'image',
    followers: 34567,
    walletAddress: '0x43c90c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37381',
    description: 'AI image generation expert'
  },
  {
    id: '4',
    name: 'Codex',
    username: 'codex',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Codex',
    category: 'code',
    followers: 45678,
    walletAddress: '0x54d91c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37382',
    description: 'AI code generation and completion'
  },
  {
    id: '5',
    name: 'Stable Diffusion',
    username: 'stablediffusion',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StableDiffusion',
    category: 'image',
    followers: 56789,
    walletAddress: '0x65e02c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37383',
    description: 'Open-source image generation model'
  },
  {
    id: '6',
    name: 'Whisper',
    username: 'whisper',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Whisper',
    category: 'audio',
    followers: 67890,
    walletAddress: '0x76f13c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37384',
    description: 'Advanced speech recognition and transcription'
  },
  {
    id: '7',
    name: 'Copilot',
    username: 'githubcopilot',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Copilot',
    category: 'code',
    followers: 78901,
    walletAddress: '0x87g24c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37385',
    description: 'AI pair programmer for GitHub'
  },
  {
    id: '8',
    name: 'ChatGPT',
    username: 'chatgpt',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChatGPT',
    category: 'chat',
    followers: 89012,
    walletAddress: '0x98h35c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37386',
    description: 'Popular conversational AI model'
  },
  {
    id: '9',
    name: 'Midjourney',
    username: 'midjourney',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Midjourney',
    category: 'image',
    followers: 90123,
    walletAddress: '0xa9i46c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37387',
    description: 'AI art generation platform'
  },
  {
    id: '10',
    name: 'Runway',
    username: 'runway',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Runway',
    category: 'video',
    followers: 101234,
    walletAddress: '0xba0j57c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37388',
    description: 'AI-powered video editing and generation'
  },
  {
    id: '11',
    name: 'Anthropic Claude 2',
    username: 'claude2',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Claude2',
    category: 'featured',
    followers: 112345,
    walletAddress: '0xcb1k68c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37389',
    description: 'Latest version of Claude with enhanced capabilities'
  },
  {
    id: '12',
    name: 'Stable Audio',
    username: 'stableaudio',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StableAudio',
    category: 'audio',
    followers: 123456,
    walletAddress: '0xdc2l79c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37390',
    description: 'AI music and audio generation'
  },
  {
    id: '13',
    name: 'Replit Ghost',
    username: 'replitghost',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ReplitGhost',
    category: 'code',
    followers: 134567,
    walletAddress: '0xed3m80c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37391',
    description: 'AI coding assistant for Replit'
  },
  {
    id: '14',
    name: 'Character.AI',
    username: 'characterai',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CharacterAI',
    category: 'chat',
    followers: 145678,
    walletAddress: '0xfe4n81c26d9965dc1da46253720e0bbdb0f53063e4179847f06428b8da6d37392',
    description: 'AI character chat platform'
  }
]

export function Home() {
  const [selectedCategory, setSelectedCategory] = useState<AICategory>('featured')

  // 计算每个分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<AICategory, number> = {
      all: mockAIs.length,
      featured: 0,
      chat: 0,
      image: 0,
      video: 0,
      audio: 0,
      code: 0
    }
    
    mockAIs.forEach(ai => {
      counts[ai.category]++
    })
    
    return counts
  }, [])

  const filteredAIs = selectedCategory === 'all' 
    ? mockAIs 
    : mockAIs.filter(ai => ai.category === selectedCategory)

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Hero />
        <div className="container mx-auto px-4 py-8">
          {/* Category Tabs */}
          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span>{categoryLabels[category]}</span>
                {category !== 'featured' && (
                  <span className="ml-1 text-xs opacity-75">
                    ({categoryCounts[category]})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* AI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAIs.map(ai => (
              <AICard key={ai.id} ai={ai} />
            ))}
          </div>

          {/* Empty State */}
          {filteredAIs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No AI characters found in this category
              </p>
            </div>
          )}
        </div>

        {/* Create AI Section */}
        <CreateAISection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
} 