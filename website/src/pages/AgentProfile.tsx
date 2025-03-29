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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAgent from "../hooks/use-agent";
import useAgentCaps from "../hooks/use-agent-caps";
import { SEO } from "../components/layout/SEO";
import { useUpdateAgent } from "../hooks/use-agent-update";
import { SessionKeyGuard, useCurrentAddress } from "@roochnetwork/rooch-sdk-kit";
import { RoochAddress, Serializer } from "@roochnetwork/rooch-sdk";
import { useNetworkVariable } from "../hooks/use-networks";
import useAgentTask from "../hooks/use-agent-task";
import { TaskSpecification } from "../types/task-types";
import { createEmptyTaskSpec } from "../utils/task";
import { useUpdateAgentTaskTask } from "../hooks/use-agent-task-update";
import { useAgentMemories } from "../hooks/use-agent-memories";

const roochscanBaseUrl = "https://test.roochscan.io";

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
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    prompt?: string;
  }>({});

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

  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Display name cannot be empty'
    }
    if (name.length < 2) {
      return 'Display name must be at least 2 characters'
    }
    if (name.length > 64) {
      return 'Display name cannot exceed 64 characters'
    }
    if (name.includes('\n')) {
      return 'Display name cannot contain line breaks'
    }
    if (/^\s+$/.test(name)) {
      return 'Display name cannot contain only whitespace'
    }
    return null
  }

  const validateDescription = (description: string): string | null => {
    if (description.length > 256) {
      return 'Description cannot exceed 256 characters'
    }
    if (description.includes('\n')) {
      return 'Description cannot contain line breaks'
    }
    if (description.trim() && /^\s+$/.test(description)) {
      return 'Description cannot contain only whitespace'
    }
    return null
  }

  const validatePrompt = (prompt: string): string | null => {
    if (prompt.length > 4096) {
      return 'Prompt cannot exceed 4096 characters'
    }
    if (prompt.trim() && /^\s+$/.test(prompt)) {
      return 'Prompt cannot contain only whitespace'
    }
    return null
  }

  const handleEdit = async () => {
    if (isEditing) {
      // 验证表单
      const newErrors: {
        name?: string;
        description?: string;
        prompt?: string;
      } = {};

      const nameError = validateName(editForm.name || '');
      if (nameError) {
        newErrors.name = nameError;
      }

      const descriptionError = validateDescription(editForm.description || '');
      if (descriptionError) {
        newErrors.description = descriptionError;
      }

      if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        return;
      }

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
      setFormErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handlePromptEdit = async () => {
    if (!isOwner) return;

    if (isEditingPrompt) {
      // 验证 prompt
      const promptError = validatePrompt(editForm.prompt || '');
      if (promptError) {
        setFormErrors(prev => ({
          ...prev,
          prompt: promptError
        }));
        return;
      }

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
      setFormErrors(prev => ({
        ...prev,
        prompt: undefined
      }));
    }
    setIsEditingPrompt(!isEditingPrompt);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
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
      <ToastContainer />
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
                          className={`block w-full text-sm bg-transparent border rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none ${formErrors.name ? 'border-red-500' : ''}`}
                          placeholder="Enter name"
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                        )}
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
                      className={`block w-full text-sm text-gray-600 dark:text-gray-300 bg-transparent border rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none ${formErrors.description ? 'border-red-500' : ''}`}
                      placeholder="Enter description"
                      rows={2}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                    )}
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
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                          {agent?.agent_address}
                        </code>
                        <button
                          onClick={() => handleCopy(agent?.agent_address || '')}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Address"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <a
                        href={`${roochscanBaseUrl}/account/${agent?.agent_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer mt-0.5"
                      >
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">View on Explorer</span>
                      </a>
                    </div>
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
                  <>
                    <textarea
                      value={editForm.prompt}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          prompt: e.target.value,
                        }))
                      }
                      className={`block w-full text-gray-600 dark:text-gray-300 bg-transparent border rounded-lg p-4 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none font-mono text-sm leading-relaxed ${formErrors.prompt ? 'border-red-500' : ''}`}
                      placeholder="Enter AI character's prompt..."
                      rows={12}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {formErrors.prompt && (
                        <p className="text-sm text-red-500">{formErrors.prompt}</p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {4096 - (editForm.prompt?.length || 0)}/4096 characters remaining
                      </p>
                    </div>
                  </>
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
                {isOwner ? (
                  <SessionKeyGuard onClick={() => {
                    if (!isAddingTask) {
                      setIsAddingTask(true);
                      setTaskSpecs([...taskSpecs, createEmptyTaskSpec()]);
                    } else {
                      setIsJsonMode(!isJsonMode);
                    }
                  }}>
                    <button
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
                  </SessionKeyGuard>
                ) : (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <LockClosedIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">Only owner can edit</span>
                  </div>
                )}
              </div>

              {taskSpecs.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="mx-auto w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                    <InboxIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Tasks Yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    This AI agent doesn't have any tasks yet. {isOwner ? 'Click the "Add Task" button to create the first task.' : ''}
                  </p>
                </div>
              ) : isOwner ? (
                <>
                  {/* Task List with Editor */}
                  {isJsonMode ? (
                    <div className="space-y-4">
                      <textarea
                        className="w-full h-96 font-mono text-sm p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                        value={JSON.stringify(taskSpecs, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setTaskSpecs(parsed);
                          } catch (error) {
                            // 如果 JSON 解析失败，不更新状态
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {taskSpecs.map((task, index) => (
                        <div
                          key={index}
                          className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                                Task #{index + 1}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Task Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                value={task.name}
                                onChange={(e) => {
                                  const newTasks = [...taskSpecs];
                                  newTasks[index] = { ...newTasks[index], name: e.target.value };
                                  setTaskSpecs(newTasks);
                                }}
                                className="block w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                                placeholder="Enter task name"
                              />
                            </div>

                            {/* Task Description */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                              </label>
                              <textarea
                                value={task.description}
                                onChange={(e) => {
                                  const newTasks = [...taskSpecs];
                                  newTasks[index] = { ...newTasks[index], description: e.target.value };
                                  setTaskSpecs(newTasks);
                                }}
                                className="block w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                                placeholder="Enter task description"
                                rows={3}
                              />
                            </div>

                            {/* Resolver */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Resolver
                              </label>
                              <input
                                type="text"
                                value={task.resolver}
                                onChange={(e) => {
                                  const newTasks = [...taskSpecs];
                                  newTasks[index] = { ...newTasks[index], resolver: e.target.value };
                                  setTaskSpecs(newTasks);
                                }}
                                className="block w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                                placeholder="Enter resolver"
                              />
                            </div>

                            {/* Arguments */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Arguments
                                </label>
                              </div>
                              <button
                                onClick={() => {
                                  const newTasks = [...taskSpecs];
                                  newTasks[index] = {
                                    ...newTasks[index],
                                    arguments: [...(newTasks[index].arguments || []), { name: '', type: 'String', type_desc: '', description: '', required: false }]
                                  };
                                  setTaskSpecs(newTasks);
                                }}
                                className="w-full flex items-center justify-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 py-2 rounded-lg mb-3"
                              >
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Add Argument
                              </button>
                              <div className="space-y-3">
                                {(task.arguments || []).map((arg, argIndex) => (
                                  <div key={argIndex} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 space-y-2">
                                        <input
                                          type="text"
                                          value={arg.name}
                                          onChange={(e) => {
                                            const newTasks = [...taskSpecs];
                                            newTasks[index].arguments[argIndex] = { ...arg, name: e.target.value };
                                            setTaskSpecs(newTasks);
                                          }}
                                          className="block w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                                          placeholder="Argument name"
                                        />
                                        <input
                                          type="text"
                                          value={arg.type_desc}
                                          onChange={(e) => {
                                            const newTasks = [...taskSpecs];
                                            newTasks[index].arguments[argIndex] = { ...arg, type_desc: e.target.value };
                                            setTaskSpecs(newTasks);
                                          }}
                                          className="block w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                                          placeholder="Type description"
                                        />
                                        <textarea
                                          value={arg.description}
                                          onChange={(e) => {
                                            const newTasks = [...taskSpecs];
                                            newTasks[index].arguments[argIndex] = { ...arg, description: e.target.value };
                                            setTaskSpecs(newTasks);
                                          }}
                                          className="block w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                                          placeholder="Argument description"
                                          rows={2}
                                        />
                                      </div>
                                      <div className="flex items-center space-x-2 ml-2">
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            checked={arg.required}
                                            onChange={(e) => {
                                              const newTasks = [...taskSpecs];
                                              newTasks[index].arguments[argIndex] = { ...arg, required: e.target.checked };
                                              setTaskSpecs(newTasks);
                                            }}
                                            className="w-4 h-4 text-purple-600 dark:text-purple-400 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                                          />
                                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Required</span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Task Details */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Price (RGas)
                                </label>
                                <input
                                  type="number"
                                  value={task.price}
                                  onChange={(e) => {
                                    const newTasks = [...taskSpecs];
                                    newTasks[index] = { ...newTasks[index], price: e.target.value };
                                    setTaskSpecs(newTasks);
                                  }}
                                  className="block w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                                  placeholder="Enter price"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Type
                                </label>
                                <select
                                  value={task.on_chain ? "on-chain" : "off-chain"}
                                  onChange={(e) => {
                                    const newTasks = [...taskSpecs];
                                    newTasks[index] = { ...newTasks[index], on_chain: e.target.value === "on-chain" };
                                    setTaskSpecs(newTasks);
                                  }}
                                  className="block w-full text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none"
                                >
                                  <option value="on-chain">On-chain</option>
                                  <option value="off-chain">Off-chain</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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
                        onClick={handleSubmmitTask}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // Read-only view for non-owners
                <div className="space-y-4">
                  {taskSpecs.map((task, index) => (
                    <div
                      key={index}
                      className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                              Task #{index + 1}
                            </span>
                          </div>

                          {/* Task Name */}
                          <div className="mb-3">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Name
                            </label>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {task.name || 'No name specified'}
                            </h4>
                          </div>

                          {/* Task Description */}
                          <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Description
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {task.description || 'No description provided'}
                            </p>
                          </div>

                          {/* Resolver */}
                          <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Resolver
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm rounded-lg flex-1">
                                {task.resolver || 'No resolver specified'}
                              </span>
                              <button
                                onClick={() => handleCopy(task.resolver || '')}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title="Copy to Clipboard"
                              >
                                <ClipboardIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Arguments Section */}
                          <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">
                              Arguments
                            </label>
                            {task.arguments && task.arguments.length > 0 ? (
                              <div className="space-y-3">
                                {task.arguments.map((arg, argIndex) => (
                                  <div key={argIndex} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                        {arg.name}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({arg.type_desc})
                                      </span>
                                      {arg.required && (
                                        <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                                          Required
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {arg.description || 'No description provided'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                No arguments defined
                              </div>
                            )}
                          </div>

                          {/* Task Details */}
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-lg">
                                {task.price || 0} RGas
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                              <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm rounded-lg">
                                {task.on_chain ? "On-chain" : "Off-chain"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
