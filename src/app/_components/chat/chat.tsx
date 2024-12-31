"use client";

import useAuthGuard from "@/app/hooks/useAuthGuard";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "./useChat";

export default function Chat({ stationId }: { stationId: string }) {
  const [message, setMessage] = useState("");
  const { messages, sendMessage } = useChat(stationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const withAuth = useAuthGuard();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesEndRef]);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;

    setShouldAutoScroll(isAtBottom);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, shouldAutoScroll]);

  const handleSend = () => {
    if (!message.trim()) return;
    withAuth(() => {
      sendMessage(message);
      setMessage("");
    });
  };

  return (
    <div className="flex flex-col h-full w-full md:w-96 bg-background-light border rounded-lg max-h-[calc(100vh-8rem)] my-auto">
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{msg.user.displayName}</span>
              <span className="text-xs text-muted-foreground">{dayjs(msg.createdAt).format("h:mm A")}</span>
            </div>
            <p className="text-sm break-words max-w-[calc(100%-2rem)]">{msg.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-background-light rounded px-3 py-2 text-sm border"
          />
          <button onClick={handleSend} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
