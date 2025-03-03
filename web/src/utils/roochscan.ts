import { NetworkType } from '@roochnetwork/rooch-sdk';

/**
 * Gets the appropriate Roochscan URL for the specified network
 * @param network The Rooch network type
 * @returns The base URL for Roochscan on the specified network
 */
export function getRoochscanUrl(network: NetworkType): string {
  switch (network) {
    case 'mainnet':
      return 'https://roochscan.io';
    case 'testnet':
      return 'https://test.roochscan.io';
    case 'devnet':
      return 'https://dev.roochscan.io';
    case 'local':
      return 'http://local.roochscan.io';
    default:
      // Default to testnet if an unknown network is provided
      return 'https://test.roochscan.io';
  }
}

/**
 * Constructs a URL for viewing an account on Roochscan
 * @param network The Rooch network type
 * @param address The account address
 * @returns The full URL to view the account on Roochscan
 */
export function getAccountUrl(network: NetworkType, address: string): string {
  return `${getRoochscanUrl(network)}/account/${address}`;
}