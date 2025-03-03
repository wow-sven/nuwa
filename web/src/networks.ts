import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk'
import { createNetworkConfig } from "@roochnetwork/rooch-sdk-kit"
import { getRoochscanUrl } from './utils/roochscan'

import { PACKAGE_ID } from './constants'

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    mainnet: {
      url: getRoochNodeUrl("mainnet"),
      variables: {
        packageId: PACKAGE_ID,
        roochscanUrl: getRoochscanUrl("mainnet"),
      },
    },
    devnet: {
      url: getRoochNodeUrl("devnet"),
      variables: {
        packageId: PACKAGE_ID,
        roochscanUrl: getRoochscanUrl("devnet"),
      },
    },
    testnet: {
      url: getRoochNodeUrl("testnet"),
      variables: {
        packageId: PACKAGE_ID,
        roochscanUrl: getRoochscanUrl("testnet"),
      },
    },
    localnet: {
      url: getRoochNodeUrl("localnet"),
      variables: {
        packageId: PACKAGE_ID,
        roochscanUrl: getRoochscanUrl("localnet"),
      },
    },
  })

export { useNetworkVariable, useNetworkVariables, networkConfig }