import React from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ClaimGasStep } from "@/components/onboarding/steps/ClaimGasStep";
import { CreateAgentStep } from "@/components/onboarding/steps/CreateAgentStep";
import { useAuth } from "@/lib/auth/AuthContext";

export function CreateAgentDIDPage() {
  const { userDid } = useAuth();
  const navigate = useNavigate();

  const [agentDid, setAgentDid] = React.useState<string | null>(null);

  if (!userDid) {
    navigate("/auth/login");
    return null;
  }

  const handleAgentCreated = (did: string) => {
    setAgentDid(did);
  };

  const handleGasClaimed = () => {
    navigate("/dashboard");
  };

  return (
    <MainLayout hasSidebar={false}>
      <div className="max-w-2xl mx-auto py-8">
        {agentDid ? (
          <ClaimGasStep agentDid={agentDid} onComplete={handleGasClaimed} />
        ) : (
          <CreateAgentStep userDid={userDid} onComplete={handleAgentCreated} />
        )}
      </div>
    </MainLayout>
  );
}
