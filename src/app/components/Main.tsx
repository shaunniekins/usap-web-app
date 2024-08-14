// src/app/components/Main.tsx

"use client";

import { addToQueue, checkIdInQueue, deleteFromQueue } from "@/api/userQueue";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../../utils/supabase";
import { fetchMessages, sendMessage } from "@/api/messages";
import {
  deleteChatSession,
  fetchSession,
  updateSessionUser1,
  updateSessionUser2,
} from "@/api/chatSession";
import SearchingText from "./SearchingText";
import { AiFillHeart } from "react-icons/ai";
import Image from "next/image";
import Navbar from "./Navbar";

const MainComponent = () => {
  const [currentAction, setCurrentAction] = useState<
    "none" | "search" | "chat"
  >("none");
  const [userId, setUserId] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [user, setUser] = useState<number | null>(null);
  const [partnerConnected, setPartnerConnected] = useState(true);

  useEffect(() => {
    // Check if userId exists in localStorage, if not, create and store it
    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem("userId", storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Check if user has an existing chat session or is in the queue
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
          setCurrentAction("chat");
          if (sessionData[0].user1_id === userId) {
            setUser(1);
            setPartnerConnected(sessionData[0].user2_connection);
          } else if (sessionData[0].user2_id === userId) {
            setUser(2);
            setPartnerConnected(sessionData[0].user1_connection);
          }
          return;
        }

        const userExists = await checkIdInQueue(userId);
        if (userExists) {
          setCurrentAction("search");
        }
      }
    };

    fetchAndSetAction();
  }, [userId]);

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
            if (payload.eventType === "INSERT") {
              handleInsert(payload);
            } else if (payload.eventType === "UPDATE") {
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
  }, [userId]);

  const startSearch = async () => {
    if (userId) {
      const userExists = await checkIdInQueue(userId);

      if (userExists) {
        console.log(
          "User ID already exists in the queue. Please try again later."
        );
      } else {
        setCurrentAction("search");
        addToQueue(userId);
      }
    }
  };

  const handleInsert = (payload: any) => {
    try {
      if (
        userId !== null &&
        (payload.new.user1_id === userId || payload.new.user2_id === userId)
      ) {
        setPartnerConnected(true);
        setChatSessionId(payload.new.id);
        setCurrentAction("chat");
        if (payload.new.user1_id === userId) {
          setUser(1);
        } else if (payload.new.user2_id === userId) {
          setUser(2);
        }
      }
    } catch (error) {
      console.error("Error handling INSERT event:", error);
    }
  };

  const handleUpdate = async (payload: any) => {
    try {
      if (
        userId !== null &&
        (payload.new.user1_id === userId || payload.new.user2_id === userId)
      ) {
        const sessionData = await fetchSession(userId as string);
        const sessionsWithBothConnections = sessionData.filter(
          (session: any) => session.user1_connection && session.user2_connection
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

        if (currentAction !== "chat") {
          setCurrentAction("chat");
        }

        // Check if both users have left
        if (!payload.new.user1_connection && !payload.new.user2_connection) {
          handleLeave();
        }
      }
    } catch (error) {
      console.error("Error handling UPDATE event:", error);
    }
  };

  const handleLeave = useCallback(async () => {
    if (userId && user && chatSessionId) {
      if (user === 1) {
        await updateSessionUser1(userId, false);
      } else if (user === 2) {
        await updateSessionUser2(userId, false);
      }

      setCurrentAction("none");
      setChatSessionId(null);
      setMessages([]);
      setUser(null);

      if (!partnerConnected) {
        await deleteChatSession(chatSessionId);
      }
    }
  }, [userId, user, chatSessionId, partnerConnected]);

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

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-[100svh] w-screen flex items-center justify-center">
      {currentAction === "search" ? (
        <div className="h-full w-full flex flex-col items-center">
          <div className="top-5 left-5 absolute">
            <button
              className="text-sm text-gray-400"
              onClick={() => {
                setCurrentAction("none");
                userId && deleteFromQueue(userId);
              }}
            >
              cancel
            </button>
          </div>

          <div className="h-full flex justify-center items-center">
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="circle1 pulse w-[200px] h-[200px] z-0 absolute bg-purple-500 rounded-full" />
              <div className="circle2 pulseCircle2 w-[600px] h-[600px] z-10 absolute bg-purple-400 rounded-full" />
              <div className="circle1 pulseCircle1 w-[400px] h-[400px] z-20 absolute bg-purple-200 rounded-full" />
            </div>
          </div>
          <div className="text-gray-400 text-lg bottom-16 absolute">
            <SearchingText />
          </div>
        </div>
      ) : currentAction === "chat" ? (
        <div className="w-full h-full flex flex-col items-center p-3 gap-3 bg-purple-50">
          <Navbar />
          <div className="h-full w-full flex flex-col justify-end overflow-y-auto text-black mt-20">
            <p className="text-gray-900 text-sm text-center font-semibold">
              You're chatting with someone. Say hi!
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
                    className={`inline-block max-w-[70%] px-5 py-2 rounded-full break-words ${
                      message.user_id === userId
                        ? "bg-purple-200"
                        : "bg-gray-100"
                    }`}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
            {!partnerConnected && (
              <p className="text-gray-400 text-sm text-center font-semibold">
                Your partner has left the chat.
              </p>
            )}
          </div>
          <div className="w-full flex items-center gap-3">
            <div className="w-full h-12">
              {!partnerConnected ? (
                <button
                  className="h-full w-full bg-blue-700 text-white text-sm px-6 rounded-lg"
                  onClick={() => {
                    handleLeave();
                    startSearch();
                  }}
                >
                  New Chat
                </button>
              ) : (
                <textarea
                  className="w-full text-black px-2 py-3 rounded-lg border resize-none"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={!partnerConnected}
                  rows={1}
                />
              )}
            </div>

            {!(messageContent === "" || !partnerConnected) && (
              <button
                className="h-full w-20 bg-purple-700 text-white px-6 rounded-lg"
                onClick={handleSendMessage}
              >
                Send
              </button>
            )}

            {messageContent === "" && partnerConnected && (
              <button
                className="h-full w-20 bg-red-700 text-white text-sm px-6 rounded-lg"
                onClick={() => {
                  if (window.confirm("Are you sure you want to leave?")) {
                    handleLeave();
                  }
                }}
              >
                Leave
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full w-full flex flex-col items-center">
          <Navbar />
          <div className="h-full flex justify-center items-center">
            <button
              className="p-5 bg-purple-700 text-white rounded-full"
              onClick={startSearch}
            >
              <AiFillHeart size={130} color="white" />
            </button>
          </div>
          <p className="text-gray-400 text-sm bottom-16 absolute">
            Tap to start
          </p>
        </div>
      )}
    </div>
  );
};

export default MainComponent;
