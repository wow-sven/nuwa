import { ArrowLeftIcon, ClipboardIcon, PencilIcon, CheckIcon, XMarkIcon, PhotoIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useRgasBalance from "../hooks/use-rgas-balance";
import useAllBalance from "../hooks/use-all-balance";
import { normalizeCoinIconUrl } from "../utils/icon";
import { SEO } from '../components/layout/SEO';
import useUserInfo from '../hooks/use-user-info';
import { useUserUpdate } from '../hooks/use-user-update';
import { SessionKeyGuard, useCurrentAddress } from '@roochnetwork/rooch-sdk-kit';
import { useTransfer } from '../hooks/use-transfer';
import { TypeArgs } from '@roochnetwork/rooch-sdk';

export const UserProfile = () => {
  const navigate = useNavigate()
  const { address } = useParams()
  const currentAddress = useCurrentAddress()
  const isOwnProfile = currentAddress?.genRoochAddress().toBech32Address() === address
  const { balance: rGas, isPending: isRgasPending, isError: isRgasError, refetchBalance } = useRgasBalance(address)
  const { balance, isPending: isBalancePending, isError: isBalanceError, refetchBalance: refetchAllBalance } = useAllBalance(address)
  const { userInfo, isPending: isUserInfoPending, isError: isUserInfoError, refetch: refetchUserInfo } = useUserInfo(address)
  const { mutate: updateUser, isPending: isUpdating } = useUserUpdate()
  const { mutate: transfer, isPending: isTransferring } = useTransfer()
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferForm, setTransferForm] = useState({
    recipient: '',
    amount: '',
    coinType: ''
  })
  const [currentToken, setCurrentToken] = useState<{ name: string; symbol: string } | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    avatar: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    if (userInfo) {
      setEditForm({
        name: userInfo.name,
        avatar: userInfo.avatar
      })
    }
  }, [userInfo])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleEditName = async () => {
    if (isEditingName) {
      // Save changes
      console.log(userInfo)
      if (editForm.name !== userInfo?.name) {
        try {
          await updateUser({
            objId: userInfo?.id || '',
            name: editForm.name,
          })
          await refetchUserInfo()
          setIsEditingName(false)
        } catch (error) {
          console.error('Failed to update user name:', error)
        }
      } else {
        setIsEditingName(false)
      }
    } else {
      // Start editing
      setEditForm(prev => ({
        ...prev,
        name: userInfo?.name || ''
      }))
      setIsEditingName(true)
    }
  }

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setEditForm(prev => ({ ...prev, name: newName }))
  }

  const handleCancelName = () => {
    setEditForm(prev => ({
      ...prev,
      name: userInfo?.name || ''
    }))
    setIsEditingName(false)
  }

  const handleEditAvatar = async () => {
    if (isEditingAvatar) {
      // Save changes
      if (editForm.avatar !== userInfo?.avatar) {
        try {
          await updateUser({
            objId: userInfo?.id || '',
            avatar: editForm.avatar
          })
          await refetchUserInfo()
          setIsEditingAvatar(false)
        } catch (error) {
          console.error('Failed to update user avatar:', error)
        }
      } else {
        setIsEditingAvatar(false)
      }
    } else {
      // Start editing
      setEditForm(prev => ({
        ...prev,
        avatar: userInfo?.avatar || ''
      }))
      setIsEditingAvatar(true)
    }
  }

  const handleCancelAvatar = () => {
    setEditForm(prev => ({
      ...prev,
      avatar: userInfo?.avatar || ''
    }))
    setIsEditingAvatar(false)
  }

  const totalPages = balance ? Math.ceil(balance.length / itemsPerPage) : 0
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageTokens = balance?.slice(startIndex, endIndex)

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleTransfer = async (token: any) => {
    setTransferForm(prev => ({
      ...prev,
      coinType: token.coin_type
    }))
    setCurrentToken({
      name: token.name,
      symbol: token.symbol
    })
    setIsTransferModalOpen(true)
  }

  const handleTransferSubmit = async () => {
    try {
      console.log(transferForm.coinType);
      await transfer({
        recipient: transferForm.recipient,
        amount: BigInt(Number(transferForm.amount) * 100_000_000), // Convert to smallest unit
        coinType: { target: transferForm.coinType }
      })
      setIsTransferModalOpen(false)
      refetchAllBalance()
      refetchBalance()
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  if (isRgasPending || isBalancePending || isUserInfoPending) {
    return <div>Loading...</div>
  }

  if (isRgasError || isBalanceError || isUserInfoError || !userInfo) {
    return <div>Error loading user profile</div>
  }

  return (
    <>
      <SEO
        title="Profile"
        description="Manage your Nuwa account on Rooch, view your AI agents, and track your interactions with autonomous AI agents on the blockchain."
        keywords="User Profile, Nuwa Account, AI Agent Management, Blockchain AI, User Dashboard"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span>Back</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4 group w-32 h-32">
                <div className="w-full h-full relative rounded-full overflow-hidden">
                  <img
                    src={editForm.avatar}
                    alt={userInfo.name}
                    className="w-full h-full rounded-full border-0 border-white dark:border-gray-800 bg-white dark:bg-gray-800 object-cover"
                  />
                  {isOwnProfile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black opacity-0 group-hover:opacity-50 transition-opacity">
                      <PhotoIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <SessionKeyGuard onClick={handleEditAvatar}>
                      <button
                        className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
                        title="Edit Avatar URL"
                      >
                        <PencilIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </SessionKeyGuard>
                  </div>
                )}
              </div>

              {isEditingAvatar && isOwnProfile && (
                <div className="mb-4 flex items-center space-x-2">
                  <input
                    type="text"
                    value={editForm.avatar}
                    onChange={e => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                    className="flex-1 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                    placeholder="Enter avatar URL"
                    disabled={isUpdating}
                  />
                  <button
                    onClick={handleEditAvatar}
                    disabled={isUpdating}
                    className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50"
                    title="Save"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelAvatar}
                    disabled={isUpdating}
                    className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50"
                    title="Cancel"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Name and Edit Button */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  {isEditingName && isOwnProfile ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={handleNameChange}
                          className="block flex-1 text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                          placeholder="Enter display name"
                          disabled={isUpdating}
                        />
                        <button
                          onClick={handleEditName}
                          disabled={isUpdating}
                          className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50"
                          title="Save"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelName}
                          disabled={isUpdating}
                          className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50"
                          title="Cancel"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {userInfo.name}
                      </h1>
                      {isOwnProfile && (
                        <SessionKeyGuard onClick={handleEditName}>
                          <button
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Edit Display Name"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </SessionKeyGuard>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-1 flex flex-col space-y-2">
                  <div className="text-gray-500 dark:text-gray-400">
                    @{userInfo.username}
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {address}
                    </code>
                    <button
                      onClick={() => handleCopy(address?.toString() || '')}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy Address"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* RGAS Balance */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    RGAS Balance
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {rGas?.toLocaleString()} RGAS
                  </p>
                </div>
              </div>

              {/* Portfolio Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Portfolio
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Refresh"
                    onClick={() => refetchAllBalance()}
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {currentPageTokens?.map((token) => (
                    <div
                      key={token.coin_type}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={token.icon_url ? normalizeCoinIconUrl(token.icon_url) : `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5"/><path d="M15 8.5C14.315 7.81501 13.1087 7.33003 12 7.33003C9.42267 7.33003 7.33333 9.41937 7.33333 12C7.33333 14.5807 9.42267 16.67 12 16.67C13.1087 16.67 14.315 16.185 15 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13.3333 12H16.6667M16.6667 12L15.3333 10.5M16.6667 12L15.3333 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')}`}
                          alt={token.name}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 p-1.5"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {token.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {token.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {token.fixedBalance}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {token.symbol}
                          </p>
                        </div>
                        <SessionKeyGuard onClick={() => handleTransfer(token)}>
                          <button
                            className="px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border border-purple-600 dark:border-purple-400 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                            disabled={isTransferring}
                          >
                            {isTransferring ? 'Transferring...' : 'Transfer'}
                          </button>
                        </SessionKeyGuard>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'
                        }`}
                    >
                      <ChevronLeftIcon className="w-5 h-5 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'
                        }`}
                    >
                      Next
                      <ChevronRightIcon className="w-5 h-5 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Transfer {currentToken?.symbol || ''}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={transferForm.recipient}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter recipient address"
                  disabled={isTransferring}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter amount"
                  disabled={isTransferring}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  disabled={isTransferring}
                >
                  Cancel
                </button>
                <SessionKeyGuard onClick={handleTransferSubmit}>
                  <button
                    disabled={isTransferring || !transferForm.recipient || !transferForm.amount}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTransferring ? 'Transferring...' : 'Transfer'}
                  </button></SessionKeyGuard>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 