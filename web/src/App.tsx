import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Theme} from "@radix-ui/themes";
import { Toaster } from 'react-hot-toast';
import { Drawer } from 'vaul';
import { useCurrentSession } from '@roochnetwork/rooch-sdk-kit';
import type { Channel } from './types/channel';

import "@roochnetwork/rooch-sdk-kit/dist/index.css"; 
import '@radix-ui/themes/styles.css'                 
import './App.css'                                    

function App() {
  const navigate = useNavigate();
  const session = useCurrentSession();

  const handleChannelClick = (channel: Channel) => {
    navigate(`/channel/${channel.id}`);
  };

  const handleCreateAgent = () => {
    navigate('/create-agent');
  };

  return (
    <div className="rooch-chat-app">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      <div className="md:hidden fixed bottom-4 left-4 z-10">
        <Drawer.Root>
          <Drawer.Trigger asChild>
            <button className="rounded-full bg-blue-500 text-white p-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18h18M3 12h18M3 6h18"/>
              </svg>
            </button>
          </Drawer.Trigger>
          {/* Add your drawer content here */}
          <Drawer.Portal>
            <Drawer.Content className="bg-white p-4 rounded-t-xl fixed bottom-0 left-0 right-0 max-h-[80vh]">
              <div className="max-w-md mx-auto">
                <div className="h-1.5 w-12 bg-gray-300 rounded-full mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-4">Channels</h2>
                {/* You would add your channel list component here */}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>

      <Toaster position="bottom-left" />
    </div>
  );
}

export default App;
