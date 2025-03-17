import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AICard } from '../components/AICard'
import { Hero } from '../components/Hero'
import { CreateAISection } from '../components/CreateAISection'
import { Footer } from '../components/Footer'
import { mockAgents } from '../mocks/agent'

export function Home() {
  const trendingAgents = useMemo(() => mockAgents.filter(ai => ai.isTrending), [])
  const featuredAgents = useMemo(() => mockAgents.filter(ai => ai.isFeatured), [])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Hero />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold">Explore Agents</h2>
              <Link
                to="/allagents"
                className="mx-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                View All Agents
              </Link>
            </div>

            {/* Trending Agents */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4">Trending Agents</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-6">
                {trendingAgents.slice(0, 4).map(ai => (
                  <AICard key={ai.address} ai={ai} />
                ))}
              </div>
            </div>

            {/* Featured Agents */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4">Featured Agents</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-6">
                {featuredAgents.slice(0, 4).map(ai => (
                  <AICard key={ai.address} ai={ai} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create AI Section */}
        <CreateAISection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
} 