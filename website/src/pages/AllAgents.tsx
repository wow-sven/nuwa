import { AgentCard } from '../components/AgentCard'
import useAllAgents from '../hooks/use-all-agents'
import { SEO } from '../components/SEO'

export const AllAgents = () => {
    const { agents, isPending, isError } = useAllAgents()

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-500">Error loading agents</div>
            </div>
        )
    }

    return (
        <>
            <SEO
                title="All Agents"
                description="Browse all AI agents on Nuwa platform. Discover and interact with autonomous AI agents that can manage crypto assets and execute on-chain operations."
                keywords="AI Agents, Web3 AI, Autonomous Agents, Crypto Agents, Blockchain AI, Nuwa Agents"
            />
            <div className="min-h-screen">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="text-3xl font-bold mb-8">All Agents</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {agents.map(ai => (
                            <AgentCard key={ai.agent_address} agent={ai} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
} 