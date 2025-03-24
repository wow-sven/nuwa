import {
    UseMutationOptions,
    UseMutationResult,
    useMutation,
  } from "@tanstack/react-query";
  
  import { Transaction, Args } from "@roochnetwork/rooch-sdk";
  import { useCurrentSession, useRoochClient } from "@roochnetwork/rooch-sdk-kit";
  import { mutationKeys } from "./mutationKeys";
  import { useNetworkVariable } from "./use-networks";

  type BaseMessageType = {
    channelId: string;
    content: string;
    mentions: string[];
    // replyTo: string;
    aiAddress: string;
  }
  
  type UseChannelMessageSendArgs = BaseMessageType | BaseMessageType & {
    payment?: number;
  };
  
  type useChannelMessageSendResult = void;
  
  type useChannelMessageSendOptions = Omit<
    UseMutationOptions<useChannelMessageSendResult, Error, UseChannelMessageSendArgs, unknown>,
    "mutationFn"
  >;
  
  export function useChannelMessageSend({
    mutationKey,
    ...mutationOptions
  }: useChannelMessageSendOptions = {}): UseMutationResult<
  useChannelMessageSendResult,
    Error,
    UseChannelMessageSendArgs,
    unknown
  > {
    const client = useRoochClient();
    const session = useCurrentSession();
    const packageId = useNetworkVariable("packageId");
  
    return useMutation({
      mutationKey: mutationKeys.snedChannelMessage(mutationKey),
      mutationFn: async (args) => {
        const hasPayment ='payment' in args && args.aiAddress && args.payment != undefined;

        const mentions = args.mentions || [];
        const content = args.content.toLowerCase();
        let finalContent = args.content;
        if (content.startsWith('/ai') || content.startsWith('@ai')) {
            finalContent = args.content.substring(3).trim();
            mentions.push(args.aiAddress);
        }

        const tx = new Transaction();
        if (hasPayment) {
            tx.callFunction({
              target: `${packageId}::channel_entry::send_message_with_coin`,
              args: [
                Args.objectId(args.channelId), 
                Args.string(args.content),
                Args.vec('address', args.mentions),
                Args.u64(0n),
                Args.address(args.aiAddress),
                Args.u256(BigInt((args as BaseMessageType & {payment: number}).payment)),
              ],
              typeArgs: ['0x3::gas_coin::RGas'],
            });
          } else {
            tx.callFunction({
              target: `${packageId}::channel_entry::send_message`,
              args: [
                Args.objectId(args.channelId), 
                Args.string(finalContent),
                Args.vec('address', args.mentions),
                Args.u64(0n),
              ],
            });
          }

        tx.setMaxGas(5_00000000);
        
        const result = await client.signAndExecuteTransaction({
          transaction: tx,
          signer: session!,
        });
  
        if (result.execution_info.status.type !== 'executed') {
          throw new Error('Failed to send message');
        }
      },
      ...mutationOptions,
    });
  }
