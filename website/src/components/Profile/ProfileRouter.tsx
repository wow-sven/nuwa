import { useParams, useNavigate } from 'react-router-dom'
import { AgentProfile } from '../../pages/AgentProfile'
import { UserProfile } from '../../pages/UserProfile'
import useAgentWithAddress from '../../hooks/use-agent-with-address'
import { NotFound } from '../../pages/NotFound'
import useAddressByUsername from '../../hooks/use-address-by-username'
import { LoadingScreen } from '../layout/LoadingScreen'
import { RoochAddress } from '@roochnetwork/rooch-sdk'
import { useEffect } from 'react'
import useUserInfo from '../../hooks/use-user-info'

export function ProfileRouter() {
    const { identifier } = useParams<{ identifier: string }>()
    const navigate = useNavigate()

    // 使用 RoochAddress 检查是否是有效的地址
    const isAddress = (() => {
        try {
            if (!identifier) return false
            new RoochAddress(identifier)
            return true
        } catch {
            return false
        }
    })()

    // 如果 identifier 是地址，检查是否是 agent 或 user
    const { agent, isPending: isAgentPending, isError: isAgentError } = useAgentWithAddress(isAddress ? identifier : undefined)
    const { userInfo, isPending: isUserPending, isError: isUserError } = useUserInfo(isAddress ? identifier : undefined)

    // 如果 identifier 是用户名，尝试获取对应的地址
    const { address, isPending: isAddressPending } = useAddressByUsername(!isAddress ? identifier : undefined)

    // 为用户名类型添加 agent 和 userInfo 查询
    const { agent: usernameAgent, isPending: isUsernameAgentPending } = useAgentWithAddress(address || undefined)
    const { userInfo: usernameUserInfo, isPending: isUsernameUserPending } = useUserInfo(address || undefined)

    // 重定向逻辑
    useEffect(() => {
        if (isAddress) {
            if (!isAgentPending && agent?.username) {
                navigate(`/profile/${agent.username}`, { replace: true })
            } else if (!isUserPending && userInfo?.username) {
                navigate(`/profile/${userInfo.username}`, { replace: true })
            }
        }
    }, [agent, userInfo, isAgentPending, isUserPending, navigate, isAddress])

    if (!identifier) {
        return <NotFound />
    }

    // 处理地址类型的 identifier
    if (isAddress) {
        if (isAgentPending || isUserPending) {
            return <LoadingScreen />
        }

        if (agent) {
            return <div className="h-screen overflow-auto"><AgentProfile address={identifier} /></div>
        }

        if (userInfo) {
            return <UserProfile address={identifier} />
        }

        return <NotFound />
    }

    // 处理用户名类型的 identifier
    if (isAddressPending || isUsernameAgentPending || isUsernameUserPending) {
        return <LoadingScreen />
    }

    if (!address) {
        return <NotFound />
    }

    // 根据地址类型显示对应的 Profile
    if (usernameAgent) {
        return <div className="h-screen overflow-auto"><AgentProfile address={address} /></div>
    }

    if (usernameUserInfo) {
        return <UserProfile address={address} />
    }

    return <NotFound />
} 