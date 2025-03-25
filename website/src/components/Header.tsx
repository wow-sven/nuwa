import { Link } from 'react-router-dom'
import { ConnectButton, useCurrentAddress, useConnectionStatus } from '@roochnetwork/rooch-sdk-kit'
import { ThemeToggle } from './ThemeToggle'
import { User } from '../types/user'
import useRgasBalance from '../hooks/use-rgas-balance'
import { useEffect, useState } from 'react'
import { mockUser } from '../mocks/user'
import { useSubscribeOnRequest } from '@roochnetwork/rooch-sdk-kit'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface HeaderProps {
    isDarkMode: boolean
}

export function Header({ isDarkMode }: HeaderProps) {
    const [user, setUser] = useState<User | null>(null)
    const address = useCurrentAddress()
    const connectionStatus = useConnectionStatus()
    const { rGas, refetchBalance } = useRgasBalance()
    const subscribeOnRequest = useSubscribeOnRequest()

    useEffect(() => {
        const unsubscribe = subscribeOnRequest((status) => {
            switch (status) {
                case 'success':
                    refetchBalance()
                    break
            }
        })

        return () => {
            unsubscribe()
        }
    }, [subscribeOnRequest, address, refetchBalance])

    useEffect(() => {
        if (connectionStatus === 'connected') {
            setUser({
                ...mockUser,
                rgasBalance: rGas?.fixedBalance || 0
            })
        }
    }, [rGas])

    const handleLogout = () => {
        setUser(null)
        const prefix = 'rooch-sdk-kit'
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key)
            }
        })
        window.location.reload()
    }

    const formatAddress = (address: string | undefined) => {
        if (!address) return ''
        if (address.length <= 6) return address
        return `${address.slice(0, 5)}...${address.slice(-3)}`
    }

    return (
        <div className="fixed top-0 right-0 left-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
            <div className="h-full flex items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <img
                        src={isDarkMode ? "/nuwa-logo-horizontal-dark.svg" : "/nuwa-logo-horizontal.svg"}
                        alt="Nuwa Logo"
                        className="h-8 w-auto"
                    />
                </Link>

                {/* Right side content */}
                <div className="flex items-center space-x-4">
                    <Link
                        to="/docs/intro"
                        className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                        Documentation
                    </Link>
                    <div className="p-1">
                        <ThemeToggle />
                    </div>
                    {!user ? (
                        <ConnectButton
                            className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                            Connect Wallet
                        </ConnectButton>
                    ) : (
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center space-x-4 focus:outline-none">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex flex-col text-left">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {user.name || formatAddress(user.address)}
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {user.rgasBalance.toLocaleString()} RGAS
                                    </span>
                                </div>
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/studio"
                                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                                >
                                                    AI Studio
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to={`/user/profile/${user.name}`}
                                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                                >
                                                    Profile
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                        } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                                >
                                                    Log Out
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    )}
                </div>
            </div>
        </div>
    )
} 