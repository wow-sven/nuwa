import { useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { useQuery } from "@tanstack/react-query";
import { AllBalance } from "../types/user";
import { RoochAddress } from "@roochnetwork/rooch-sdk";

export default function useAllBalance(address: string | undefined): AllBalance {
  const client = useRoochClient()

  const {
    data: balance,
    isPending,
    isError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['useBalance', address],
    queryFn: async () => {
      const balance = await client
        .getBalances({
          owner: new RoochAddress(address!).toBech32Address(),
        })
      return balance
    },
    enabled: !!address
  })

  return {
    balance: balance?.data || [],
    isPending,
    isError,
    refetchBalance
  }
}