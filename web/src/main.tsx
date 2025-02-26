import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Theme } from '@radix-ui/themes';
import { Toaster } from 'react-hot-toast';
import { RoochProvider,WalletProvider } from '@roochnetwork/rooch-sdk-kit';

import App from './App';
import { Home } from './pages/Home';
import { ChannelPage } from './pages/Channel';
import { CreateAgent } from './pages/CreateAgent';
import { AgentDetail } from './pages/AgentDetail';
import { PACKAGE_ID } from './constants';
import { networkConfig } from './networks';
import { ErrorGuard } from "./ErrorGuard.tsx";

import { NetworkVariables } from './contexts/NetworkVariablesContext';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/channel/:channelId',
        element: <ChannelPage />,
      },
      {
        path: '/create-agent',
        element: <CreateAgent />,
      },
      {
        path: '/agent/:agentId',
        element: <AgentDetail />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme appearance="light">
      <QueryClientProvider client={queryClient}>
        <RoochProvider 
          networks={networkConfig} 
          sessionConf={{
            appName: "Nuwa AI Agents",
            appUrl: "https://nuwa.rooch.io/",
            scopes: [`${PACKAGE_ID}::*::*`],
            maxInactiveInterval: 3600,
          }} 
          defaultNetwork='testnet'
        >
          <NetworkVariables
            variables={{
              packageId: PACKAGE_ID,
            }}
          >
            <WalletProvider preferredWallets={['UniSat']} chain={'bitcoin'} autoConnect>
              <ErrorGuard/>
              <RouterProvider router={router} />
              <Toaster position="bottom-right" />
            </WalletProvider>
          </NetworkVariables>
        </RoochProvider>
      </QueryClientProvider>
    </Theme>
  </React.StrictMode>
);
