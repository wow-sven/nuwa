import { useMemo, useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Message } from "../types/chat";
import {
  PlusIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { mockMembers } from "../mocks/chat";
import type { ChatMember } from "../mocks/chat";
import useAgentChannels from "../hooks/use-agent-channels";
import useChannel from "../hooks/use-channel";
import useAgentWithAddress from "../hooks/use-agent-with-address";
import useChannelMessageCount from "../hooks/use-channel-message-count";
import useChannelJoinedStatus from "../hooks/use-channel-joined-status";
import useChannelMessages from "../hooks/use-channel-messages";
import { SessionKeyGuard, useCurrentAddress } from "@roochnetwork/rooch-sdk-kit";
import { ChatMessage } from "../components/ChatMessage";
import { useChannelMessageSend } from "../hooks/use-channel-message-send";
import { LoadingButton } from "../components/loading-button";
import { useChannelJoin } from "../hooks/use-channel-join";
import useChannelMembers from "../hooks/use-channel-member";
import { toShortStr } from "@roochnetwork/rooch-sdk";

export function AgentChat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const [members] = useState<ChatMember[]>(mockMembers);
  const [inputMessage, setInputMessage] = useState("");

  const address = useCurrentAddress()
  const { channels } = useAgentChannels(id || "");
  const { members } = useChannelMembers({
    channelId: channels,
    limit: '10'
  })
  const { channelInfo } = useChannel(channels || "");
  const { agent } = useAgentWithAddress(channelInfo?.agentAddress || "");
  const { messageCount, refetch: refetchMessageCount } = useChannelMessageCount(channels || "");
  const { isJoined, refetch: refetchJoinStatus } = useChannelJoinedStatus(channels || "");
  const { mutateAsync: sendMessage, isPending: sendingMessage } = useChannelMessageSend()
  const { mutateAsync: joinChannel, isPending: joiningChannel} = useChannelJoin()

  console.log(members)
  // console.log(channels);
  // console.log(channelInfo);
  // console.log(agent);
  console.log(messageCount);
  // console.log(isJoined);
  // console.log(msg)

  const initialPage = useMemo(() => {
    if (messageCount === 0) return 0;
    return Math.max(0, Math.ceil(messageCount / 100) - 1);
  }, [messageCount]);

  const { messages: msg, refetch: refetchMsg } = useChannelMessages({
    channelId: channels || "",
    page: initialPage,
    size: 100,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [msg]);

  const handleAction = async () => {
    if (!isJoined) {
      try {
        await joinChannel({ address: channels || "" });
        await refetchJoinStatus();
      } catch (e) {
        console.log(e);
      }
    }

    const msg = inputMessage;
      setInputMessage("");
      try {
        await sendMessage({
          channelId: channels || "",
          content: msg,
          mentions: [],
          aiAddress: agent?.address || "",
        });
        await refetchMessageCount();
        await refetchMsg();
        scrollToBottom();
      } catch (e) {
        console.log(e);
      }
  };

  // const handleSelectTopic = (topicId: string) => {
  //   setSelectedTopic(topics.find((t) => t.id === topicId) || null);
  //   setMessages([]); // In real app, we would load messages for the selected topic
  // };

  const handleTopicClick = (topicId: string) => {
    // const topic = topics.find((t) => t.id === topicId);
    // if (topic) {
    //   handleSelectTopic(topicId);
    //   // Scroll the topic into view in the sidebar
    //   const topicElement = document.getElementById(`topic-${topicId}`);
    //   if (topicElement) {
    //     topicElement.scrollIntoView({ behavior: "smooth", block: "center" });
    //   }
    // }
  };

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.sender === address?.genRoochAddress().toHexAddress();
    const isAI = message.sender === agent?.address;

    return (
      <ChatMessage 
        key={`${message.index}-${message.channel_id}`}
        message={message} 
        isCurrentUser={isCurrentUser}
        isAI={isAI}
        agentName={agent?.name}
        agentId={agent?.id}
      />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Dialog List
            </h2>
          </div>
          <div className="overflow-y-auto">
            {/* {topics.map((topic) => ( */}
              <div
                key={channels}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  true
                    ? "bg-purple-50 dark:bg-purple-900/20"
                    : ""
                }`}
                onClick={() => {}}
              >
                <div className="flex items-center space-x-3">
                  <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      Home
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {/* {topic.lastMessage} */}
                      TODO
                    </p>
                  </div>
                  {/* {topic.unread > 0 && ( */}
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-purple-600 rounded-full">
                      {/* {topic.unread} */}
                      0
                    </span>
                  {/* )} */}
                </div>
              </div>
            {/* ))} */}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {agent?.name} Home
            </h2>
          </div>

          {/* Messages Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(100vh - 13rem)" }}>
            {msg.map(renderMessage)}
            <div ref={messagesEndRef}/>  
          </div>
          
          <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              {isJoined && (
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAction()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
              <SessionKeyGuard onClick={handleAction}>
                <LoadingButton isPending={sendingMessage || joiningChannel} className={isJoined ? '' : 'w-full'} onClick={() => {}}>
                  {
                    isJoined ?(
                      <PaperAirplaneIcon className="w-5 h-5" />
                    ):(<>Join</>)
                  }
                </LoadingButton>
              </SessionKeyGuard>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Agent Profile & Members List */}
        <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          {/* Agent Profile Section */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <img
                src="https://api.dicebear.com/7.x/bottts/svg?seed=1"
                alt="AI Avatar"
                className="w-16 h-16 rounded-full"
              />
              <div className="mt-2 text-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Task Helper
                </h2>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  @task_helper
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-gray-400" />
                <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {members.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Members
                </div>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  $2.5
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Price
                </div>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-gray-400" />
                <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  $3M
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  MCap
                </div>
              </div>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => navigate(`/agent/profile/${id}`)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 mt-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
            >
              <UserCircleIcon className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </button>
          </div>

          {/* Members List Section */}
          <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Members
              </h2>
            </div>
            <button
              onClick={() => {
                /* TODO: 实现添加成员功能 */
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-20rem)]">
            {members.map((member) => (
              <div
                key={member.address}
                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={member.avatar}
                    alt={toShortStr(member.address)}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {toShortStr(member.address)}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {0} RGAS
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
