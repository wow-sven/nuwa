import {
    UseMutationOptions,
    UseMutationResult,
    useMutation,
  } from "@tanstack/react-query";
  
  import { Transaction, Args } from "@roochnetwork/rooch-sdk";
  import { useCurrentSession, useRoochClient } from "@roochnetwork/rooch-sdk-kit";
  import { mutationKeys } from "./mutationKeys";
  import { useNetworkVariable } from "./use-networks";
  
  type UseUserUpdateArgs = {
    objId: string;
    name?: string;
    avatar?: string;
  };
  
  type UseUserUpdateResult = void;
  
  type UseUserUpdateOptions = Omit<
    UseMutationOptions<UseUserUpdateResult, Error, UseUserUpdateArgs, unknown>,
    "mutationFn"
  >;
  
  // This hook is used to update the user information
  // Only one value can be updated at a time
  export function useUserUpdate({
    mutationKey,
    ...mutationOptions
  }: UseUserUpdateOptions = {}): UseMutationResult<
    UseUserUpdateResult,
    Error,
    UseUserUpdateArgs,
    unknown
  > {
    const client = useRoochClient();
    const session = useCurrentSession();
    const packageId = useNetworkVariable("packageId");
  
    return useMutation({
      mutationKey: mutationKeys.updateUser(mutationKey),
      mutationFn: async (args) => {
        const agentTx = new Transaction();
  
        if (args.name) {
          agentTx.callFunction({
            target: `${packageId}::user_profile::update_user_profile_name`,
            args: [Args.objectId(args.objId), Args.string(args.name)],
          });
        }
  
        if (args.avatar) {
          agentTx.callFunction({
            target: `${packageId}::user_profile::update_user_profile_avatar`,
            args: [Args.objectId(args.objId), Args.string(args.avatar)],
          });
        }
  
        const result = await client.signAndExecuteTransaction({
          transaction: agentTx,
          signer: session!,
        });
  
        if (result.execution_info.status.type !== "executed") {
          throw new Error(
            `Agent update failed: ${JSON.stringify(
              result.execution_info.status
            )}`
          );
        }
      },
      ...mutationOptions,
    });
  }
  