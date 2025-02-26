import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useRoochClient, useRoochClientQuery, useCurrentSession } from '@roochnetwork/rooch-sdk-kit';
import { useNetworkVariable } from '../hooks/useNetworkVariable';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import { Layout } from '../components/Layout';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { Channel, Message, CHANNEL_STATUS } from '../types/channel';
import { formatTimestamp } from '../utils/time';

export function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const [isJoining, setIsJoining] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const packageId = useNetworkVariable('packageId');
  const client = useRoochClient();
  const session = useCurrentSession();
  
  // Fetch channel details
  const { data: channelData, isLoading: isChannelLoading } = useRoochClientQuery(
    'executeViewFunction',
    {
      target: `${packageId}::nuwa_service::get_channel`,
      args: [Args.object_id(channelId)],
    },
    {
      enabled: !!packageId && !!channelId,
    }
  );
  
  const channel: Channel | undefined = channelData?.return_values?.[0]?.decoded_value;
  
  // Fetch channel messages
  const { data: messagesData, isLoading: isMessagesLoading, refetch: refetchMessages } = useRoochClientQuery(
    'executeViewFunction',
    {
      target: `${packageId}::nuwa_service::get_channel_messages`,
      args: [Args.object_id(channelId)],
    },
    {
      enabled: !!packageId && !!channelId,
      refetchInterval: 5000,
    }
  );
  
  const messages: Message[] = messagesData?.return_values?.[0]?.decoded_value || [];
  
  // Check if user is a member of the channel
  const { data: isMemberData } = useRoochClientQuery(
    'executeViewFunction',
    {
      target: `${packageId}::nuwa_service::is_channel_member`,
      args: [Args.object_id(channelId), Args.address(session.address)],
    },
    {
      enabled: !!packageId && !!channelId && !!session?.address,
    }
  );
  
  const isMember: boolean = isMemberData?.return_values?.[0]?.decoded_value || false;
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle joining the channel
  const handleJoinChannel = async () => {
    if (!client || !session || !channelId || !packageId) return;
    
    try {
      setIsJoining(true);
      setErrorMessage('');
      
      const tx = new Transaction();
      tx.callFunction({
        target: `${packageId}::channel::join_channel_entry`,
        arguments: [Args.object_id(channelId)],
      });
      
      const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: session.address,
      });
      
      if (result.execution_info.status.type !== 'executed') {
        throw new Error('Failed to join channel');
      }
      
      // Refetch data after joining
      setTimeout(() => {
        refetchMessages();
      }, 1000);
      
    } catch (error) {
      console.error('Error joining channel:', error);
      setErrorMessage('Failed to join channel. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!client || !session || !channelId || !packageId || content.trim() === '') return;
    
    try {
      setIsSending(true);
      setErrorMessage('');
      
      const tx = new Transaction();
      tx.callFunction({
        target: `${packageId}::channel::send_message_entry`,
        arguments: [
          Args.object_id(channelId), 
          Args.string(content),
          Args.vector([]) // Empty mentions for now
        ],
      });
      
      const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: session.address,
      });
      
      if (result.execution_info.status.type !== 'executed') {
        throw new Error('Failed to send message');
      }
      
      // Refetch messages after sending
      setTimeout(() => {
        refetchMessages();
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Loading state
  if (isChannelLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin h-10 w-10 border-t-2 border-blue-500 border-r-2 rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  // Channel not found or error state
  if (!channel) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 text-center">
          <h2 className="text-xl font-semibold text-red-600">Channel not found</h2>
          <p className="mt-2 text-gray-600">The channel you're looking for doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }
  
  // Check if channel is inactive
  const isChannelActive = channel.status === CHANNEL_STATUS.ACTIVE;
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Channel Header */}
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{channel.title}</h1>
          <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
            <div>
              {channel.message_counter} messages • Created: {formatTimestamp(channel.created_at)}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs ${
              isChannelActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isChannelActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-red-700">
            {errorMessage}
          </div>
        )}
        
        {/* Join button for non-members */}
        {!isMember && isChannelActive && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex justify-between items-center">
              <p className="text-blue-700">
                Join this channel to participate in the conversation.
              </p>
              <button
                className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                onClick={handleJoinChannel}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Channel'}
              </button>
            </div>
          </div>
        )}
        
        {/* Messages */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 h-[calc(100vh-280px)] overflow-y-auto">
          {isMessagesLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No messages yet. Be the first to send a message!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  isCurrentUser={message.sender === session?.address}
                  isAI={message.message_type === 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <div className="mt-4">
          {!isChannelActive ? (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
              This channel is no longer active.
            </div>
          ) : !isMember ? (
            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
              Join this channel to send messages.
            </div>
          ) : (
            <>
              {isSending && <TypingIndicator />}
              <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={!isMember || isSending || !isChannelActive}
                placeholder="Type your message..."
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
