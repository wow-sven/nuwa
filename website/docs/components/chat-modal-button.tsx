"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircleIcon } from "lucide-react";
import Chat from "./chat";
import Image from "next/image";

const ChatModalButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <MessageCircleIcon className="w-4 h-4" />
          <span className="text-sm">Ask Nuwa Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] dark:from-[#1e293b] dark:to-[#0f172a] rounded-2xl shadow-lg border border-[#e5e7eb] dark:border-[#334155] [&>button:last-child]:hidden"
        style={{ minHeight: 800, minWidth: 800 }}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2 rounded-full">
              <Image
                src="/nuwa-app.png"
                alt="Nuwa App Icon"
                width={24}
                height={24}
                className="rounded-full"
              />
              Nuwa Guide GPT
            </span>
          </DialogTitle>
        </DialogHeader>
        <Chat />
      </DialogContent>
    </Dialog>
  );
};

export default ChatModalButton;
