"use client";

import { fetchMessages, sendMessage } from "@/api/messages";
import Navbar from "@/components/Navbar";
import TypingIndicatorDots from "@/components/TypingIndicatorDots";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../utils/supabase";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import {
  deleteChatSession,
  fetchSession,
  updateSessionUser1,
  updateSessionUser2,
} from "@/api/chatSession";
import startSearch from "@/utils/searchService";
import { useSessionCheck } from "@/hooks/useSessionCheck";
import { LoadingScreen } from "@/components/Loading";

export default function Search() {
  const router = useRouter();
  const userId = useSessionCheck();
  const [chatSessionId, setChatSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const { isTyping, sendTypingEvent } = useTypingIndicator({
    roomId: chatSessionId?.toString() || "",
    userId: userId || "",
  });

  const [user, setUser] = useState<number | null>(null);
  const [partnerConnected, setPartnerConnected] = useState(true);

  useEffect(() => {
    const fetchAndSetAction = async () => {
      if (userId) {
        const sessionData = await fetchSession(userId);
        if (
          sessionData.length > 0 &&
          ((sessionData[0].user1_id === userId &&
            sessionData[0].user1_connection) ||
            (sessionData[0].user2_id === userId &&
              sessionData[0].user2_connection))
        ) {
          setChatSessionId(sessionData[0].id);
          if (sessionData[0].user1_id === userId) {
            setUser(1);
            setPartnerConnected(sessionData[0].user2_connection);
          } else if (sessionData[0].user2_id === userId) {
            setUser(2);
            setPartnerConnected(sessionData[0].user1_connection);
          }
          return;
        }
      }
    };

    fetchAndSetAction();
  }, [userId]);

  const handleLeave = useCallback(
    async (isHome: boolean = false) => {
      if (userId && user && chatSessionId) {
        if (user === 1) {
          await updateSessionUser1(userId, false);
        } else if (user === 2) {
          await updateSessionUser2(userId, false);
        }

        setChatSessionId(null);
        setUser(null);

        if (isHome) {
          router.push("/");
        } else {
          await startSearch(userId, router);
        }

        if (!partnerConnected) {
          await deleteChatSession(chatSessionId);
        }
      }
    },
    [userId, user, chatSessionId, partnerConnected, router]
  );

  const handleUpdate = useCallback(
    async (payload: any) => {
      try {
        if (
          userId !== null &&
          (payload.new.user1_id === userId || payload.new.user2_id === userId)
        ) {
          const sessionData = await fetchSession(userId as string);
          const sessionsWithBothConnections = sessionData.filter(
            (session: any) =>
              session.user1_connection && session.user2_connection
          );

          if (sessionsWithBothConnections.length > 0) {
            return;
          } else {
            if (
              (payload.new.user1_id !== userId &&
                !payload.new.user1_connection) ||
              (payload.new.user2_id !== userId && !payload.new.user2_connection)
            ) {
              setPartnerConnected(false);
              return;
            }
          }

          if (payload.new.user1_id === userId) {
            handleLeave();
            return;
          } else if (payload.new.user2_id === userId) {
            handleLeave();
            return;
          }

          // Check if both users have left
          if (!payload.new.user1_connection && !payload.new.user2_connection) {
            handleLeave();
          }
        }
      } catch (error) {
        console.error("Error handling UPDATE event:", error);
      }
    },
    [userId, setPartnerConnected, handleLeave]
  );

  // Handle connection checks
  useEffect(() => {
    if (userId) {
      const channel = supabase
        .channel("chat_sessions")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chat_sessions",
          },
          (payload) => {
            if (payload.eventType === "UPDATE") {
              handleUpdate(payload);
            }
          }
        )
        .subscribe((status) => {
          if (status !== "SUBSCRIBED") {
            console.error("Error subscribing to channel:", status);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, handleUpdate]);

  // messages

  const handleSendMessage = async () => {
    if (chatSessionId !== null && userId !== null && partnerConnected) {
      const messageData = {
        chat_session_id: chatSessionId,
        user_id: userId,
        content: messageContent,
      };
      setMessageContent("");
      await sendMessage(messageData);
    }
  };

  const memoizedFetchMessages = useCallback(async () => {
    if (chatSessionId !== null) {
      const fetchedMessages = await fetchMessages(chatSessionId);
      setMessages(fetchedMessages);
    }
  }, [chatSessionId]);

  useEffect(() => {
    if (chatSessionId) {
      memoizedFetchMessages();

      const channel = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_session_id=eq.${chatSessionId}`,
          },
          (payload) => {
            if (payload.new.chat_session_id === chatSessionId) {
              setMessages((messages) => [...messages, payload.new]);
              if (payload.new.user_id !== userId) playNotificationSound();
              showBrowserNotification(payload.new);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatSessionId, memoizedFetchMessages]);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setIsPartnerTyping(isTyping);
  }, [isTyping]);

  const handleNavbarLeave = () => {
    handleLeave(true);
  };

  // notification
  const playNotificationSound = () => {
    const audio = new Audio("/message-pop.mp3");
    audio.play();
  };

  const showBrowserNotification = (message: any) => {
    if (
      "Notification" in window &&
      Notification.permission === "granted" &&
      !document.hasFocus()
    ) {
      new Notification("New Message", { body: message.content });
    }
  };

  if (!userId) {
    return <LoadingScreen />;
  }

  return (
    <div className="screen-container">
      <div className="w-full h-full flex flex-col items-center p-3 gap-3">
        <Navbar
          onLeave={handleNavbarLeave}
          partnerConnected={partnerConnected}
        />

        <div className="h-full w-full flex flex-col justify-end overflow-y-auto text-black mt-20">
          <p className="text-theme text-sm text-center font-semibold mb-5">
            You&apos;re chatting with someone. Say hi!
          </p>
          <div
            ref={messageContainerRef}
            className="overflow-y-auto flex flex-col gap-2"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.user_id === userId ? "justify-end" : "justify-start"
                }`}
              >
                <p
                  className={`inline-block max-w-[70%] px-4 py-2 rounded-full break-words ${
                    message.user_id === userId ? "purple-theme" : "gray-theme"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
          </div>
          {isPartnerTyping && partnerConnected && (
            <div className="text-sm text-gray-500 italic">
              <TypingIndicatorDots />
            </div>
          )}

          {!partnerConnected && (
            <p className="text-theme text-xs text-center font-semibold mt-8">
              Your partner has left the chat.
            </p>
          )}
        </div>
        <div className="w-full flex items-center gap-3 md:mb-5">
          <div className="w-full h-12">
            {!partnerConnected ? (
              <button
                className="h-full w-full bg-blue-700 text-white text-sm px-6 rounded-lg"
                onClick={() => {
                  handleLeave();
                }}
              >
                New Chat
              </button>
            ) : (
              <textarea
                className="w-full px-4 py-3 rounded-3xl resize-none appearance-none focus:outline-none shadow-md text-area-theme"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={sendTypingEvent}
                placeholder="Type your message here..."
                disabled={!partnerConnected}
                rows={1}
              />
            )}
          </div>

          {partnerConnected && (
            <button
              className={`h-full w-20 text-black rounded-full shadow-md button-theme ${
                messageContent === "" ? "bg-red-200 text-sm" : "text-purple-600"
              }`}
              onClick={() => {
                if (messageContent === "") {
                  if (window.confirm("Are you sure you want to leave?")) {
                    handleLeave();
                  }
                } else {
                  handleSendMessage();
                }
              }}
            >
              {messageContent === "" ? "STOP" : "SEND"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
