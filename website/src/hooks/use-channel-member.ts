import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";

export default function useChannelMembers(input: {
  channelId?: string;
  cursor?: string;
  limit: string;
}) {
  const client = useRoochClient();

  const {
    data: members,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["useChannelMembers", input],
    queryFn: async () => {
      const result = await client.queryObjectStates({
        filter:{
          object_id: input.channelId!
        }
      });

      const decode = result.data[0].decoded_value?.value as any;

      const table = decode.members.value.handle.value.id

      const data = await client.listStates({
        accessPath: `/table/${table}`,
        cursor: input.cursor,
        limit: input.limit
      })
      return data.data.map((item: any) => {
        const address = item.state.decoded_value.value.value.value.address
        return {
          address: address,
          avatar:`https://api.dicebear.com/7.x/bottts/svg?seed=${address}`
        }
      });
    },
    enabled: !!input.channelId,
  });

  return {
    members:members||[],
    isPending,
    isError,
    refetch,
  };
}
