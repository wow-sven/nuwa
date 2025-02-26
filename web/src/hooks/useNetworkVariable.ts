import { useNetworkVariables } from "../contexts/NetworkVariablesContext";

/**
 * Hook to access a specific network variable by key
 * @param key The variable key to access
 * @param defaultValue Optional default value if the variable doesn't exist
 * @returns The value of the network variable
 */
export function useNetworkVariable(key: string, defaultValue?: string): string {
  const variables = useNetworkVariables();
  
  // Return the variable if it exists, otherwise return the default value
  return variables[key] !== undefined ? variables[key] : (defaultValue || '');
}

/**
 * Hook specifically for accessing the packageId
 * @returns The packageId from network variables
 */
export function usePackageId(): string {
  const variables = useNetworkVariables();
  return variables.packageId;
}