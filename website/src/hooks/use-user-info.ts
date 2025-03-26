import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { useNetworkVariable } from "./use-networks";
import { UserInfo } from "../types/user";

export default function useUserInfo(address?: string) {
  const client = useRoochClient();
  const packageId = useNetworkVariable("packageId");

  const {
    data: userInfo,
    isPending,
    isError,
    refetch,
  } = useQuery<UserInfo>({
    queryKey: ["useUserInfo", address],
    queryFn: async () => {
      const resultA = await client.queryObjectStates({
        filter: {
          object_type_with_owner: {
            object_type: `${packageId}::user_profile::UserProfile`,
            owner: address!,
          },
        },
      })

      return {
        id: String(resultA.data[0]?.id || ''),
        username: String(resultA.data[0]?.decoded_value?.value?.username || ''),
        name: String(resultA.data[0]?.decoded_value?.value?.name || ''),
        avatar: String(resultA.data[0]?.decoded_value?.value?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${String(resultA.data[0]?.decoded_value?.value?.username || '')}`),
      }
    },
    enabled: !!address,
  });

  return {
    userInfo,
    isPending,
    isError,
    refetch,
  };
}
