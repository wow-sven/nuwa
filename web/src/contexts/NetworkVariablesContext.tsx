import React, { createContext, useContext, ReactNode } from 'react';

interface NetworkVariablesContextType {
  packageId: string;
  [key: string]: string;  // Allow for additional variables
}

const NetworkVariablesContext = createContext<NetworkVariablesContextType | undefined>(undefined);

interface NetworkVariablesProps {
  variables: NetworkVariablesContextType;
  children: ReactNode;
}

export function NetworkVariables({ variables, children }: NetworkVariablesProps) {
  return (
    <NetworkVariablesContext.Provider value={variables}>
      {children}
    </NetworkVariablesContext.Provider>
  );
}

export function useNetworkVariables(): NetworkVariablesContextType {
  const context = useContext(NetworkVariablesContext);
  if (context === undefined) {
    throw new Error('useNetworkVariables must be used within a NetworkVariables provider');
  }
  return context;
}