// import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
// import { useQuery } from "@tanstack/react-query";
// import { Args } from "@roochnetwork/rooch-sdk";
// import { useNetworkVariable } from "./use-networks";
// import { useTransfer } from "./use-transfer";

// interface UseAgentTaskResult {
//   status: AgentTask;
//   isPending: boolean;
//   isError: boolean;
//   refetch: () => void;
// }

// export default function useAgentTask(id?: string): UseAgentTaskResult {
//   const client = useRoochClient();
//   const packageId = useNetworkVariable("packageId");
  
//   const {
//     data: agentStatus,
//     isPending,
//     isError,
//     refetch,
//   } = useQuery<AgentTask>({
//     queryKey: ["useAgentTask", id],
//     queryFn: async () => {
//       // const { data: taskSpecsResponse, isLoading: isTaskSpecsQueryLoading } =
//       // useRoochClientQuery(
//       //   "executeViewFunction",
//       //   {
//       //     target: `${packageId}::agent::get_agent_task_specs_json`,
//       //     args: [Args.objectId(agentId || "")],
//       //   },
//       //   {
//       //     enabled: !!client && !!packageId && !!agentId,
//       //   }
//       // );

//       return {
//         isOnline: !isProcessing,
//         lastActive,
//         currentTask: isProcessing ? "processing" : undefined
//       };
//     },
//     enabled: !!id,
//   });

//   return {
//     status: agentStatus || { isOnline: false, lastActive: Date.now() },
//     isPending,
//     isError,
//     refetch,
//   };
// }
