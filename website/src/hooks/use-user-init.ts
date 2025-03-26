import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from "@tanstack/react-query";

import { Transaction, Args } from "@roochnetwork/rooch-sdk";
import { useCurrentSession, useRoochClient } from "@roochnetwork/rooch-sdk-kit";
import { mutationKeys } from "./mutationKeys";
import { useNetworkVariable } from "./use-networks";

type UseUserInitArgs = {
  name: string;
  username: string;
  avatar?: string;
};

type UseUserInitResult = void;

type UseUserInitOptions = Omit<
  UseMutationOptions<UseUserInitResult, Error, UseUserInitArgs, unknown>,
  "mutationFn"
>;

export function useUserInit({
  mutationKey,
  ...mutationOptions
}: UseUserInitOptions = {}): UseMutationResult<
  UseUserInitResult,
  Error,
  UseUserInitArgs,
  unknown
> {
  const client = useRoochClient();
  const session = useCurrentSession();
  const packageId = useNetworkVariable("packageId");

  return useMutation({
    mutationKey: mutationKeys.initUser(mutationKey),
    mutationFn: async (args) => {
      const tx = new Transaction();
      tx.callFunction({
        target: `${packageId}::user_profile::init_profile`,
        args: [
          Args.string(args.name),
          Args.string(args.username),
          Args.string(args.avatar || ""),
        ],
      });

      tx.setMaxGas(5_00000000);

      const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: session!,
      });

      if (result.execution_info.status.type !== "executed") {
        throw new Error(
          `Failed to create profile: ${JSON.stringify(
            result.execution_info.status
          )}`
        );
      }
    },
    ...mutationOptions,
  });
}
