"use client";

import { useState, useEffect, useRef } from "react";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";
type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

const UserMessage = ({ text }: { text: string }) => {
  return (
    <div className="self-end text-white bg-gradient-to-br from-[#232526] to-[#414345] dark:from-[#18181b] dark:to-[#27272a] my-2 px-4 py-2 rounded-lg max-w-[70%] break-words shadow-md animate-fadeInUp">
      {text}
    </div>
  );
};

const AssistantMessage = ({ text }: { text: string }) => {
  // 去除【4:0†source】或[4:0†source]等标记
  const cleanedText = text.replace(/[【\[]\d+:\d+†source[】\]]/g, "");
  return (
    <div className="self-start max-w-[70%] bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] dark:from-[#232526] dark:to-[#18181b] my-2 px-4 py-2 rounded-lg break-words shadow-md border border-[#e5e7eb] dark:border-[#27272a] animate-fadeInUp">
      <Markdown
        components={{
          img: (props) => (
            <img
              {...props}
              className="max-w-full my-2 rounded-lg shadow"
              alt={props.alt || ""}
            />
          ),
        }}
      >
        {cleanedText}
      </Markdown>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className="bg-[#1e293b] dark:bg-[#18181b] my-2 px-6 py-3 rounded-2xl max-w-[70%] break-words font-mono text-[#f1f5f9] dark:text-[#d4d4d8] shadow-lg border border-[#334155] dark:border-[#27272a] animate-fadeInUp">
      {text.split("\n").map((line, index) => (
        <div key={index} className="mt-1">
          <span className="text-[#b8b8b8] mr-2">{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall
  ) => Promise<string>;
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createThread = async () => {
    const res = await fetch(`/api/assistants/threads`, {
      method: "POST",
    });
    const data = await res.json();
    setThreadId(data.threadId);
  };

  // create a new threadID when chat component created
  useEffect(() => {
    createThread();
  }, []);

  const sendMessage = async (text) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const submitActionResult = async (runId, toolCallOutputs) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runId: runId,
          toolCallOutputs: toolCallOutputs,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  // imageFileDone - show image in chat
  const handleImageFileDone = (image) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  };

  // toolCallCreated - log new tool call
  const toolCallCreated = (toolCall) => {
    if (toolCall.type != "code_interpreter") return;
    appendMessage("code", "");
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolCallDelta = (delta, snapshot) => {
    if (delta.type != "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // loop over tool calls and call function handler
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      })
    );
    setInputDisabled(true);
    submitActionResult(runId, toolCallOutputs);
  };

  // handleRunCompleted - re-enable the input form
  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    // image
    stream.on("imageFileDone", handleImageFileDone);

    // code interpreter
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    stream.on("event", (event) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event);
      if (event.event === "thread.run.completed") handleRunCompleted();
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  // Loader 组件
  const Loader = () => (
    <div className="flex items-center justify-center my-4">
      <div className="w-6 h-6 border-4 border-gray-300 border-t-[#232526] dark:border-t-[#f1f5f9] rounded-full animate-spin"></div>
      <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">
        Assistant is typing...
      </span>
    </div>
  );

  return (
    <div className="flex flex-col-reverse h-[700px] w-full">
      <div className="flex-1 flex overflow-y-auto p-4 flex-col order-2 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-[#cbd5e1] scrollbar-track-[#e5e7eb] dark:scrollbar-thumb-[#27272a] dark:scrollbar-track-[#232526]  ">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        {/* Loader: assistant 回复期间且没有 assistant 消息时显示 */}
        {inputDisabled &&
          (messages.length === 0 ||
            messages[messages.length - 1].role !== "assistant") && <Loader />}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex w-full p-4 pb-4 order-1 clearfix bg-transparent"
      >
        <Input
          type="text"
          className="flex-grow px-6 py-4 mr-2 rounded-lg border-2 border-transparent focus:outline-none focus:border-black focus:bg-white bg-[#f1f5f9] text-base shadow transition-all duration-200 dark:bg-[#232526] dark:text-white dark:focus:bg-[#18181b] dark:focus:border-white"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask anything..."
          disabled={inputDisabled}
        />
        <Button
          type="submit"
          className="px-8 py-3 bg-gradient-to-br from-[#232526] to-[#414345] text-white border-none text-base rounded-xl shadow-md hover:scale-105 hover:bg-black transition-all duration-200 disabled:bg-gray-300 dark:from-[#18181b] dark:to-[#27272a] dark:text-white dark:hover:bg-[#232526] dark:disabled:bg-[#232526]"
          disabled={inputDisabled}
        >
          <SendIcon className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default Chat;
