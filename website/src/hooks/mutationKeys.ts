import { MutationKey } from '@tanstack/react-query'

function formMutationKeyFn(baseEntity: string) {
  return function mutationKeyFn(additionalKeys: MutationKey = []) {
    return [{ ...mutationKeys.all, baseEntity }, ...additionalKeys]
  }
}

export const mutationKeys = {
  all: { baseScope: 'nuwa' },
  initUser: formMutationKeyFn('initUser'),
  transfer: formMutationKeyFn('transfer'),
  updateUser: formMutationKeyFn('updateUser'),
  updateAgent: formMutationKeyFn('updateAgent'),
  createAgent: formMutationKeyFn('create_agent'),
  joinChannel: formMutationKeyFn('join_channel'),
  snedChannelMessage: formMutationKeyFn('send_channel_message'),
}
