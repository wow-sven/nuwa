import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRoochClient, useRoochClientQuery, useCurrentSession } from '@roochnetwork/rooch-sdk-kit';
import { useNetworkVariable } from '../hooks/useNetworkVariable';
import { Args, Transaction, bcs } from '@roochnetwork/rooch-sdk';
import { Layout } from '../components/Layout';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { Channel, Message, CHANNEL_STATUS, MessageSchema } from '../types/channel'; // Add MessageSchema to imports
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
    'queryObjectStates',
    {
      filter: {
        object_id: channelId,
      },
    },
    {
      enabled: !!packageId && !!channelId,
    }
  );
  
  // Extract channel data from the response
  const channel = channelData?.data?.[0]?.decoded_value?.value;
  
  // Check if the channel is active
  const isChannelActive = channel?.status === CHANNEL_STATUS.ACTIVE;
  
  // Fetch channel messages
  const { data: messagesData, isLoading: isMessagesLoading, refetch: refetchMessages } = useRoochClientQuery(
    'executeViewFunction',
    {
      target: `${packageId}::channel::get_messages`,
      args: [Args.objectId(channelId)],
    },
    {
      enabled: !!packageId && !!channelId,
      refetchInterval: 5000,
    }
  );
  console.log('Messages data response:', messagesData);
  
  // Define function to deserialize messages
  const deserializeMessages = useMemo(() => {
    if (!messagesData?.return_values?.[0]?.value?.value) {
      console.log('No message data available');
      return [];
    }

    try {
      // Get the hex value from the response
      const hexValue = messagesData.return_values[0].value.value;
      console.log('Hex value:', hexValue);
      
      // Convert hex to bytes
      const cleanHexValue = hexValue.startsWith('0x') ? hexValue.slice(2) : hexValue;
      const bytes = new Uint8Array(
        cleanHexValue.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      
      // Parse using BCS
      if (!MessageSchema) {
        console.error('MessageSchema is not defined!');
        return [];
      }
      
      console.log('Parsing bytes with BCS:', bytes);
      const parsedMessages = bcs.vector(MessageSchema).parse(bytes);
      console.log('Parsed messages:', parsedMessages);
      
      // Map to our Message interface format
      return parsedMessages.map((message: any) => ({
        id: message.id,
        sender: message.sender,
        content: message.content,
        timestamp: message.timestamp,
        message_type: message.message_type, 
      }));
    } catch (error) {
      console.error('BCS deserialization error:', error);
      return [];
    }
  }, [messagesData]);
  
  // Use the deserialized messages
  const messages: Message[] = deserializeMessages;
  console.log('Processed messages:', messages);
  
  // Check if user is a member of the channel
  const { data: isMemberData } = useRoochClientQuery(
    'executeViewFunction',
    {
      target: `${packageId}::channel::is_channel_member`,
      args: channelId && session ? [
        Args.objectId(channelId), 
        Args.address(session.getRoochAddress())
      ] : [],
    },
    {
      // Only run this query when session is available
      enabled: !!packageId && !!channelId && !!session,
    }
  );
  
  // Default to false if not a member or if session doesn't exist
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
        args: [Args.objectId(channelId)],
      });
      
      const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: session,
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
        args: [
          Args.objectId(channelId), 
          Args.string(content),
          Args.vec('address',[]) // Empty mentions for now
        ],
      });
      
      const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: session,
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
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin h-10 w-10 border-t-2 border-blue-500 border-r-2 rounded-full"></div>
        </div>
      </Layout>
    );
  }
  
  // Channel not found or error state
  if (!channel) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 text-center flex-1 flex items-center justify-center">
          <div>
            <h2 className="text-xl font-semibold text-red-600">Channel not found</h2>
            <p className="mt-2 text-gray-600">The channel you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
     
      <div className="max-w-4xl mx-auto p-4 flex flex-col flex-1">
        {/* Channel Header */}
        <div className="border-b pb-4 mb-4 flex-shrink-0">
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
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 flex-shrink-0">
            {errorMessage}
          </div>
        )}
        
        {/* Join button for non-members */}
        {!isMember && isChannelActive && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 flex-shrink-0">
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
        
        {/* Messages - Use flex-1 instead of flex-grow to take up all available space */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex-1 flex flex-col overflow-auto">
          {isMessagesLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full"></div>
            </div>
          ) : messages && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No messages yet. Be the first to send a message!
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {Array.isArray(messages) && messages.map((message, index) => (
                <ChatMessage 
                  key={`${message.id}-${index}`}
                  message={message} 
                  isCurrentUser={message.sender === session?.getRoochAddress()}
                  isAI={message.message_type === 1}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message Input - Fixed at bottom */}
        <div className="mt-4 flex-shrink-0">
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
                onSend={handleSendMessage} 
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
