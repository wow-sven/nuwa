import { MutationKey } from '@tanstack/react-query'

function formMutationKeyFn(baseEntity: string) {
  return function mutationKeyFn(additionalKeys: MutationKey = []) {
    return [{ ...mutationKeys.all, baseEntity }, ...additionalKeys]
  }
}

export const mutationKeys = {
  all: { baseScope: 'nuwa' },
  createAgent: formMutationKeyFn('create_agent'),
  updateAgent: formMutationKeyFn('update_agent'),
  joinChannel: formMutationKeyFn('join_channel'),
  snedChannelMessage: formMutationKeyFn('send_channel_message'),
}
