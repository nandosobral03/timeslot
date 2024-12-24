import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

export function useChat(stationId: string) {
  const sendMessage = api.chat.sendMessage.useMutation();

  const [messages, setMessages] = useState<
    {
      id: string;
      content: string;
      user: {
        displayName: string;
      };
      createdAt: Date;
    }[]
  >([]);

  const { data } = api.chat.getMessages.useQuery(
    {
      stationId,
    },
    {
      refetchInterval: 10000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: true,
    }
  );

  const handleSendMessage = (content: string) => {
    sendMessage.mutate(
      {
        stationId,
        content,
      },
      {
        onSuccess: (data) => {
          if (data) {
            setMessages((prev) => [...prev, { id: data.id, content: data.content, user: data.user, createdAt: data.createdAt }]);
          }
        },
      }
    );
  };

  useEffect(() => {
    if (data) {
      setMessages((prev) =>
        data
          .filter((msg) => !prev.some((p) => p.id === msg.id))
          .reverse()
          .concat(prev)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .slice(0, 100)
      );
    }
  }, [data]);

  return {
    messages,
    sendMessage: handleSendMessage,
  };
}
