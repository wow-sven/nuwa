import { useCurrentAddress, useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { useNetworkVariable } from "./use-networks";

export default function useUserInfo() {
  const client = useRoochClient();
  const packageId = useNetworkVariable("packageId");
  const address = useCurrentAddress();

  const {
    data: userInfo,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["useUserInfo", address],
    queryFn: async () => {
      const resultA = await client.queryObjectStates({
        filter: {
          object_type_with_owner: {
            object_type: `${packageId}::user_profile::UserProfile`,
            owner: address!.toStr(),
          },
        },
      })

      return {
        id: resultA.data[0]?.id,
        username: resultA.data[0]?.decoded_value?.value?.username,
        name: resultA.data[0]?.decoded_value?.value?.name,
        avatar: resultA.data[0]?.decoded_value?.value?.avatar,
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
