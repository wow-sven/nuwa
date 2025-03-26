import { Serializer } from "@roochnetwork/rooch-sdk";
import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { useNetworkVariable } from "./use-networks";

export default function useChannelMembers(input: {
  channelId?: string;
  cursor?: string;
  limit: string;
}) {
  const client = useRoochClient();
  const packageId = useNetworkVariable("packageId");

  const {
    data: members,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["useChannelMembers", input],
    queryFn: async () => {
      const result = await client.queryObjectStates({
        filter: {
          object_id: input.channelId!,
        },
      });

      const decode = result.data[0].decoded_value?.value as any;

      const table = decode.members.value.handle.value.id;

      const data = await client.listStates({
        accessPath: `/table/${table}`,
        cursor: input.cursor,
        limit: input.limit,
      });

      const members = data.data.map((item: any) => {
        const address = item.state.decoded_value.value.value.value.address;
        return {
          address: address,
        };
      });

      const resultInfos = await client.queryObjectStates({
        filter: {
          object_id: members
            .map((item) =>
              Serializer.accountNamedObjectID(item.address, {
                address: packageId,
                module: "user_profile",
                name: "UserProfile",
              })
            )
            .join(","),
        },
      });

      const infos = resultInfos.data.map((item: any) => ({
        avatar: item.decoded_value.value.avatar as string,
        name: item.decoded_value.value.avatar as string,
        username: item.decoded_value.value.avatar as string,
      }));

      return members.map((item, index) => ({
        address: item.address,
        avatar: infos[index].avatar,
        name: infos[index].name,
        username: infos[index].username,
      }));
    },
    enabled: !!input.channelId,
  });

  return {
    members: members || [],
    isPending,
    isError,
    refetch,
  };
}
