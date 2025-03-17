import { AICard } from '../components/AICard'
import { mockAgents } from '../mocks/agent'

export function AllAgents() {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8">All Agents</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockAgents.map(ai => (
                        <AICard key={ai.address} ai={ai} />
                    ))}
                </div>
            </div>
        </div>
    )
} 