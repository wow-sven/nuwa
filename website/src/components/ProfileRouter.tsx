import { useParams, Navigate } from 'react-router-dom'
import { AgentProfile } from '../pages/AgentProfile'
import { UserProfile } from '../pages/UserProfile'
import { mockAgents } from '../mocks/agent'
import { mockUser } from '../mocks/user'

export function ProfileRouter() {
    const { username } = useParams<{ username: string }>()

    // 检查是否为 agent
    const isAgent = mockAgents.some(agent => agent.agentname === username)
    // 检查是否为 user
    const isUser = mockUser.username === username
    console.log(username)

    if (!username) {
        return <Navigate to="/" />
    }

    if (isAgent) {
        return <div className="h-screen overflow-auto"><AgentProfile /></div>
    }

    if (isUser) {
        return <UserProfile />
    }

    // 如果既不是 agent 也不是 user，重定向到首页
    return <Navigate to="/" />
} 