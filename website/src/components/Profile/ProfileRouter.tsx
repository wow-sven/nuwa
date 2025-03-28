import { useParams, Navigate } from 'react-router-dom'
import { AgentProfile } from '../../pages/AgentProfile'
import { UserProfile } from '../../pages/UserProfile'
import useAgentWithAddress from '../../hooks/use-agent-with-address'

export function ProfileRouter() {
    const { address } = useParams<{ address: string }>()
    const { agent, isPending, isError } = useAgentWithAddress(address)

    if (!address) {
        return <Navigate to="/" />
    }

    // If there is an error or the agent is not found, show the user profile
    if (isError || (!isPending && !agent)) {
        return <UserProfile />
    }

    // If the agent is found, show the agent profile
    if (!isPending && agent) {
        return <div className="h-screen overflow-auto"><AgentProfile /></div>
    }

    // If the agent is loading, show the loading state
    return <div>Loading...</div>
} 