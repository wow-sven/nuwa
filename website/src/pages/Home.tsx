import { useState, useMemo } from 'react'
import { AICard } from '../components/AICard'
import { Hero } from '../components/Hero'
import { CreateAISection } from '../components/CreateAISection'
import { Footer } from '../components/Footer'
import { AgentCategory, agentCategories, categoryLabels } from '../types/agent'
import { mockAgents } from '../mocks/agent'

export function Home() {
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory>('all')

  // Calculate count for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<AgentCategory, number> = {
      all: mockAgents.length,
      featured: 0,
      chat: 0,
      image: 0,
      video: 0,
      audio: 0,
      code: 0
    }

    mockAgents.forEach(ai => {
      if (ai.category) {
        counts[ai.category]++
      }
    })

    return counts
  }, [])

  const filteredAIs = selectedCategory === 'all'
    ? mockAgents
    : mockAgents.filter(ai => ai.category === selectedCategory)

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Hero />
        <div className="container mx-auto px-4 py-8">
          {/* Category Tabs */}
          <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
            {agentCategories.map((category: AgentCategory) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === category
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
              <AICard key={ai.address} ai={ai} />
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