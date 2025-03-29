import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { CurrencyDollarIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useState } from 'react';

interface ActionMenuProps {
    onTransferClick: () => void;
    autoMentionAI: boolean;
    onAutoMentionToggle: () => void;
    className?: string;
}

export function ActionMenu({ onTransferClick, autoMentionAI, onAutoMentionToggle, className }: ActionMenuProps) {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className={`flex items-center justify-center w-[40px] min-h-[40px] p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ${className || ''}`}>
                <EllipsisVerticalIcon className="w-5 h-5" />
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition duration-50"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <Menu.Items className="absolute bottom-full left-0 mb-2 w-56 origin-bottom-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={onTransferClick}
                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                        } group flex w-full items-center rounded-md px-4 py-2 text-sm text-gray-900 dark:text-gray-100`}
                                >
                                    <CurrencyDollarIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    Transfer RGAS to Agent
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={onAutoMentionToggle}
                                    className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                        } group flex w-full items-center rounded-md px-4 py-2 text-sm text-gray-900 dark:text-gray-100`}
                                >
                                    <SparklesIcon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    {autoMentionAI ? 'Disable Auto @AI' : 'Enable Auto @AI'}
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
} 