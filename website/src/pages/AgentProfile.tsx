import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SEO } from "../components/layout/SEO";
import {
  AgentProfileProvider,
  AgentProfilePanel,
  AgentOverviewPanel,
  AgentPromptPanel,
  AgentTasksPanel,
  AgentMemoriesPanel
} from "../components/profile";

interface AgentProfileProps {
  address: string
}

export function AgentProfile({ address }: AgentProfileProps) {
  const navigate = useNavigate();

  return (
    <AgentProfileProvider address={address}>
      <SEO
        title="Agent Profile"
        description="View detailed information about this AI agent on Nuwa platform."
        keywords="AI Agent, Web3 AI, Autonomous Agent, Crypto Agent, Blockchain AI, Nuwa Agent"
        ogUrl={`https://nuwa.dev/agents/${address}`}
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
            <span>返回</span>
          </button>

          {/* Profile Card */}
          <AgentProfilePanel />

          {/* Overview Section */}
          <AgentOverviewPanel />

          {/* Prompt Section */}
          <AgentPromptPanel />

          {/* Tasks Section */}
          <AgentTasksPanel />

          {/* Memories Section */}
          <AgentMemoriesPanel />
        </div>
      </div>
    </AgentProfileProvider>
  );
}
