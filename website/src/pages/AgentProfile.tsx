import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PencilIcon,
  ArrowLeftIcon,
  ClipboardIcon,
  LockClosedIcon,
  PlusIcon,
  InboxIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import useAgent from "../hooks/use-agent";
import useAgentCaps from "../hooks/use-agent-caps";
import { SEO } from "../components/layout/SEO";
import { useUpdateAgent } from "../hooks/use-agent-update";
import { SessionKeyGuard, useCurrentAddress } from "@roochnetwork/rooch-sdk-kit";
import { RoochAddress, Serializer } from "@roochnetwork/rooch-sdk";
import { useNetworkVariable } from "../hooks/use-networks";
import useAgentTask from "../hooks/use-agent-task";
import { TaskSpecificationEditor } from "../components/TaskSpecificationEditor";
import { TaskSpecification } from "../types/taska";
import { createEmptyTaskSpec } from "../utils/task";
import { useUpdateAgentTaskTask } from "../hooks/use-agent-task-update";
import { useAgentMemories } from "../hooks/use-agent-memories";

export function AgentProfile() {
  const { address: agentAddress } = useParams<{ address: string }>();
  const currentAddress = useCurrentAddress()?.genRoochAddress().toHexAddress();
  const packageId = useNetworkVariable("packageId");
  const agentId = Serializer.accountNamedObjectID(
    new RoochAddress(agentAddress || "").toHexAddress(),
    {
      address: packageId,
      module: "agent",
      name: "Agent",
    }
  );

  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [isSaveing, setIsSaveing] = useState(false);
  const [isSaveingPop, setIsSaveingPop] = useState(false);

  const [taskSpecs, setTaskSpecs] = useState<TaskSpecification[]>([]);

  const { mutateAsync: updateAgent } = useUpdateAgent();
  const { agent, refetch: refetchAgent } = useAgent(agentId);
  const { caps } = useAgentCaps();
  const { agentTask, refetch: refetchAgentTask } = useAgentTask(agent?.id);
  const { mutateAsync: updateAgentTaskTask } = useUpdateAgentTaskTask();
  const isOwner = useMemo(() => {
    if (agent?.id && caps.has(agent.id)) {
      return true;
    }
    return false;
  }, [agent, caps]);

  // Task related states
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [activeMemoryTab, setActiveMemoryTab] = useState<'all' | 'user'>('all');

  const [editForm, setEditForm] = useState({
    name: agent?.name,
    description: agent?.description,
    prompt: agent?.instructions,
    avatar: agent?.avatar,
  });
  const [avatarError, setAvatarError] = useState<string>("");
  const [previewAvatar, setPreviewAvatar] = useState<string>("");

  const { memories: allMemories, isLoading: isLoadingMemories, error: memoriesError, refetch: refetchMemories } = useAgentMemories({
    agentId: agent?.id || "",
  });

  const { memories: userMemories, isLoading: isLoadingUserMemories, error: userMemoriesError, refetch: refetchUserMemories } = useAgentMemories({
    agentId: agent?.id || "",
    targetAddress: currentAddress || undefined,
  });
  console.log(userMemories)
  useEffect(() => {
    if (isEditing) {
      setPreviewAvatar(editForm.avatar || "");
    }
  }, [isEditing]);

  useEffect(() => {
    if (agentTask) {
      setTaskSpecs(agentTask);
    }
  }, [agentTask]);

  useEffect(() => {
    if (JSON.stringify(taskSpecs) === JSON.stringify(agentTask || [])) {
      setIsAddingTask(false);
    } else {
      setIsAddingTask(true);
    }
  }, [taskSpecs]);

  const validateImageUrl = (url: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleAvatarChange = async (url: string) => {
    setEditForm((prev) => ({
      ...prev,
      avatar: url,
    }));
    setAvatarError("");

    if (!url) {
      setPreviewAvatar(agent?.avatar || "");
      return;
    }

    try {
      const isValid = await validateImageUrl(url);
      if (isValid) {
        setPreviewAvatar(url);
        setAvatarError("");
      } else {
        setPreviewAvatar(agent?.avatar || "");
        setAvatarError("无效的图片URL");
      }
    } catch (error) {
      setPreviewAvatar(agent?.avatar || "");
      setAvatarError("无效的图片URL");
    }
  };

  const handleSubmmitTask = async () => {
    try {
      await updateAgentTaskTask({
        cap: caps.get(agent?.id!)!.id,
        taskSpecs: taskSpecs,
      });
    } finally {
      refetchAgentTask();
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      // Save changes
      if (
        editForm.name === agent?.name &&
        editForm.description === agent?.description &&
        editForm.avatar === agent?.avatar
      ) {
        setIsEditing(false);
        return;
      }

      setIsSaveing(true);
      try {
        if (editForm.name !== agent?.name) {
          await updateAgent({
            cap: caps.get(agent?.id!)!.id,
            name: editForm.name,
          });
        }

        if (editForm.description !== agent?.description) {
          await updateAgent({
            cap: caps.get(agent?.id!)!.id,
            description: editForm.description,
          });
        }

        if (editForm.avatar !== agent?.avatar) {
          await updateAgent({
            cap: caps.get(agent?.id!)!.id,
            avatar: editForm.avatar,
          });
        }
      } finally {
        refetchAgent();
        setIsSaveing(false);
      }
    } else {
      // Start editing
      setEditForm({
        ...editForm,
        name: agent?.name || "",
        description: agent?.description || "",
        avatar: agent?.avatar || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handlePromptEdit = async () => {
    if (!isOwner) return;

    if (isEditingPrompt) {
      // Save changes
      if (editForm.prompt === agent?.instructions) {
        setIsEditingPrompt(false);
        return;
      }

      setIsSaveingPop(true);
      try {
        if (editForm.prompt !== agent?.instructions) {
          await updateAgent({
            cap: caps.get(agent?.id!)!.id,
            instructions: editForm.prompt,
          });
        }
      } finally {
        refetchAgent();
        setIsSaveingPop(false);
      }
    } else {
      // Start editing
      setEditForm({
        ...editForm,
        prompt: agent?.instructions || "",
      });
    }
    setIsEditingPrompt(!isEditingPrompt);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <SEO
        title={agent?.name ? agent.name + " | Agent Profile" : "Agent Profile"}
        description={
          agent?.description ||
          "View detailed information about this AI agent on Nuwa platform."
        }
        keywords={`${agent?.name}, AI Agent, Web3 AI, Autonomous Agent, Crypto Agent, Blockchain AI, Nuwa Agent`}
        ogUrl={`https://nuwa.dev/agents/${agentAddress}`}
      />
      <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            <span>Back</span>
          </button>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4">
                <img
                  src={
                    isEditing ? previewAvatar || agent?.avatar : agent?.avatar
                  }
                  alt={agent?.username}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Name and Username */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Avatar URL
                        </label>
                        <input
                          type="text"
                          value={editForm.avatar}
                          onChange={(e) => handleAvatarChange(e.target.value)}
                          className={`block w-full text-sm bg-transparent border rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none ${avatarError ? "border-red-500" : ""
                            }`}
                          placeholder="Enter avatar URL"
                        />
                        {avatarError && (
                          <p className="mt-1 text-sm text-red-500">
                            {avatarError}
                          </p>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="block w-full text-sm bg-transparent border rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                          placeholder="Enter name"
                        />
                      </div>
                    </>
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {agent?.name}
                    </h1>
                  )}
                  <div className="mt-1 text-purple-600 dark:text-purple-400">
                    @{agent?.username}
                  </div>
                </div>
                {isOwner && (
                  <SessionKeyGuard onClick={handleEdit}>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <PencilIcon className="w-4 h-4 mr-2" />
                      {isSaveing ? (
                        <svg
                          className="w-5 h-5 animate-spin mx-auto text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                      ) : isEditing ? (
                        "Save"
                      ) : (
                        "Edit"
                      )}
                    </button>
                  </SessionKeyGuard>
                )}
              </div>

              {/* Description */}
              <div className="max-w-2xl">
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="block w-full text-sm text-gray-600 dark:text-gray-300 bg-transparent border rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                      placeholder="Enter description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    {agent?.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Overview
              </h2>

              <div className="space-y-6">
                {/* Character Username */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Character Username
                  </h3>
                  <div className="flex items-center group">
                    <code className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex-1">
                      {agent?.username}
                    </code>
                  </div>
                </div>

                {/* Agent ID */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Agent ID
                  </h3>
                  <div className="flex items-center group">
                    <code className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex-1 break-all">
                      {agent?.id}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(
                          "0xb9e4b3c592dabbaf70dbc2e2cad66ebce0a91c2c864c99a8fa801863797893db"
                        )
                      }
                      className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy to Clipboard"
                    >
                      <ClipboardIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Agent Address */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Agent Address
                  </h3>
                  <div className="flex items-center group">
                    <code className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex-1 break-all">
                      {agent?.agent_address}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(
                          "rooch19n5zuqjc7rlcx6zgh3ln5fyateczs8n4des4v28y7gkrt7545a9qppy0rl"
                        )
                      }
                      className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy to Clipboard"
                    >
                      <ClipboardIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Character ID */}
                {/* <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Character ID
                  </h3>
                  <div className="flex items-center group">
                    <code className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex-1 break-all">
                      0x0aa7a2ed20a8683404411985f3d9347a17970c5396d5cfb7bf3906a7d2a4d67d
                    </code>
                    <button
                      onClick={() => handleCopy("0x0aa7a2ed20a8683404411985f3d9347a17970c5396d5cfb7bf3906a7d2a4d67d")}
                      className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy to Clipboard"
                    >
                      <ClipboardIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div> */}

                {/* Other Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Model Provider
                    </h3>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {agent?.modelProvider}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Last Active
                    </h3>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {agent?.lastActive}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Prompt
                </h2>
                {isOwner ? (
                  <SessionKeyGuard onClick={handlePromptEdit}>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <PencilIcon className="w-4 h-4 mr-2" />
                      {isSaveingPop ? (
                        <svg
                          className="w-5 h-5 animate-spin mx-auto text-white" // Center spinner
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                      ) : isEditingPrompt ? (
                        "Save"
                      ) : (
                        "Edit"
                      )}
                    </button>
                  </SessionKeyGuard>
                ) : (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <LockClosedIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">Only owner can edit</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {isEditingPrompt ? (
                  <textarea
                    value={editForm.prompt}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        prompt: e.target.value,
                      }))
                    }
                    className="block w-full text-gray-600 dark:text-gray-300 bg-transparent border rounded-lg p-4 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none font-mono text-sm leading-relaxed"
                    placeholder="Enter AI character's prompt..."
                    rows={12}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 font-mono text-sm leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    {agent?.instructions}
                  </pre>
                )}
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Tasks
                </h2>
                <button
                  onClick={() => {
                    if (!isAddingTask) {
                      setIsAddingTask(true);
                      setTaskSpecs([...taskSpecs, createEmptyTaskSpec()]);
                    } else {
                      setIsJsonMode(!isJsonMode);
                    }
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {!isAddingTask ? (
                    <>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Task
                    </>
                  ) : isJsonMode ? (
                    "Edit Mode"
                  ) : (
                    "JSON Mode"
                  )}
                </button>
              </div>

              {taskSpecs.length === 0 && (
                <div className="text-center py-8 px-4">
                  <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                    <InboxIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Tasks Yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    This AI agent doesn't have any tasks yet. Click the "Add
                    Task" button to create the first task.
                  </p>
                </div>
              )}

              {/* Task List */}
              <TaskSpecificationEditor
                taskSpecs={taskSpecs}
                jsonMode={isJsonMode}
                onChange={(newTask) => {
                  setTaskSpecs(newTask);
                }}
                onCancel={() => () => { }}
              />

              {isAddingTask && (
                <div className="flex justify-end mt-6 gap-4">
                  <button
                    onClick={() => {
                      setIsAddingTask(false);
                      setTaskSpecs(agentTask || []);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setTaskSpecs([...taskSpecs, createEmptyTaskSpec()]);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Task
                  </button>

                  <button
                    onClick={handleSubmmitTask}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Memories Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Memories
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveMemoryTab('all')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeMemoryTab === 'all'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      Agent Self Memories
                    </button>
                    {currentAddress && (
                      <button
                        onClick={() => setActiveMemoryTab('user')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeMemoryTab === 'user'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        Memories About You
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={activeMemoryTab === 'all' ? refetchMemories : refetchUserMemories}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                  Refresh
                </button>
              </div>

              {activeMemoryTab === 'all' ? (
                isLoadingMemories ? (
                  <div className="flex justify-center items-center py-8">
                    <svg
                      className="w-8 h-8 animate-spin text-purple-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  </div>
                ) : memoriesError ? (
                  <div className="text-center py-8 px-4">
                    <div className="mx-auto w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="w-16 h-16 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Failed to Load
                    </h3>
                    <p className="text-sm text-red-500 dark:text-red-400 max-w-sm mx-auto mb-4">
                      {memoriesError || 'Failed to load memories'}
                    </p>
                    <button
                      onClick={refetchMemories}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : allMemories.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                      <InboxIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Memories Yet
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      This AI agent doesn't have any memories yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allMemories.map((memory, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                                Memory #{index + 1}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {memory.content}
                            </p>
                            {memory.context && (
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {memory.context}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {new Date(memory.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                isLoadingUserMemories ? (
                  <div className="flex justify-center items-center py-8">
                    <svg
                      className="w-8 h-8 animate-spin text-purple-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  </div>
                ) : userMemoriesError ? (
                  <div className="text-center py-8 px-4">
                    <div className="mx-auto w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="w-16 h-16 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Failed to Load
                    </h3>
                    <p className="text-sm text-red-500 dark:text-red-400 max-w-sm mx-auto mb-4">
                      {userMemoriesError || 'Failed to load memories about you'}
                    </p>
                    <button
                      onClick={refetchUserMemories}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : userMemories.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                      <InboxIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Memories About You Yet
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      This AI agent doesn't have any memories about you yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userMemories.map((memory, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                                Memory #{index + 1}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {memory.content}
                            </p>
                            {memory.context && (
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {memory.context}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {new Date(memory.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
