"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  db,
  listenToSession,
  updateUser,
  deleteChatSession,
  getUserByUUID,
  endSession,
} from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { ChatSession, Message } from "@/types";
import Navbar from "@/components/Navbar";

export default function Session({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isPartnerLeft, setIsPartnerLeft] = useState(false);
  const [isCurrentUserLeft, setIsCurrentUserLeft] = useState(false);
  const resolvedParams = React.use(params);
  const sessionId = resolvedParams.sessionId;
  const uuid =
    typeof window !== "undefined" ? localStorage.getItem("uuid") : null;

  useEffect(() => {
    if (!sessionId || !uuid) {
      router.push("/");
      return;
    }

    const validateSession = async () => {
      const userDoc = await getUserByUUID(uuid);
      if (!userDoc || userDoc.current_session !== sessionId) {
        router.push("/");
        return;
      }
    };

    validateSession();

    const unsubscribe = listenToSession(
      sessionId,
      (sessionData: ChatSession | undefined) => {
        if (!sessionData) {
          router.push("/");
          return;
        }

        // Check if the current user is still in the session
        const isUserInSession = sessionData.users?.includes(uuid);
        setIsCurrentUserLeft(!isUserInSession);

        // Check if the other user has left
        const otherUserLeft =
          sessionData.users?.length === 1 && isUserInSession;
        setIsPartnerLeft(otherUserLeft);
      }
    );

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("session_id", "==", sessionId));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(), // Convert Firestore timestamp to Date
      })) as Message[];
      setMessages(
        msgs.sort((a, b) => {
          // Add null checks and default to 0 if timestamp is undefined
          const timeA = a.timestamp?.getTime() || 0;
          const timeB = b.timestamp?.getTime() || 0;
          return timeA - timeB;
        })
      );
    });

    return () => {
      unsubscribe();
      unsubscribeMessages();
    };
  }, [sessionId, uuid, router]);

  const handleSearchAgain = async () => {
    if (!sessionId || !uuid) return;
    await endSession(sessionId, uuid);
    router.push("/search");
  };

  const handleLeave = async () => {
    if (!sessionId || !uuid) return;
    await endSession(sessionId, uuid);
    router.push("/");
  };

  const sendMessage = async () => {
    if (!newMessage || !sessionId || !uuid) return;

    setNewMessage("");
    await addDoc(collection(db, "messages"), {
      session_id: sessionId,
      sender_id: uuid,
      content: newMessage,
      timestamp: new Date(), // This will be automatically converted to Firestore timestamp
    });
  };

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
    <div className="screen-container">
      <div className="w-full h-full flex flex-col items-center p-3 gap-3">
        <Navbar onLeave={handleLeave} partnerConnected={!isPartnerLeft} />

        <div className="h-full w-full flex flex-col justify-end overflow-y-auto text-black mt-20">
          <p className="text-theme text-sm text-center font-semibold mb-5">
            You&apos;re chatting with someone. Say hi!
          </p>
          <div
            ref={messageContainerRef}
            className="overflow-y-auto flex flex-col gap-2 custom-scrollbar"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender_id === uuid ? "justify-end" : "justify-start"
                }`}
              >
                <p
                  className={`inline-block max-w-[70%] px-4 py-2 rounded-full break-words ${
                    msg.sender_id === uuid ? "purple-theme" : "gray-theme"
                  }`}
                >
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
          {/* {isPartnerTyping && partnerConnected && (
            <p className="text-sm text-gray-500 italic">
              <TypingIndicatorDots />
            </p>
          )} */}

          {(isPartnerLeft || isCurrentUserLeft) && (
            <p className="text-theme text-xs text-center font-semibold mt-8">
              {isCurrentUserLeft
                ? "You have left the chat."
                : "Your partner has left the chat."}
            </p>
          )}
        </div>
        <div className="w-full flex items-center gap-3 md:mb-5">
          <div className="w-full h-12">
            {isPartnerLeft ? (
              <button
                className="h-full w-full bg-blue-700 text-white text-sm px-6 rounded-lg"
                onClick={() => {
                  handleSearchAgain();
                }}
              >
                New Chat
              </button>
            ) : (
              <textarea
                className="w-full px-4 py-3 rounded-3xl resize-none appearance-none focus:outline-none shadow-md text-area-theme"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                // onKeyDown={sendTypingEvent}
                placeholder="Type your message here..."
                disabled={isPartnerLeft || isCurrentUserLeft}
                rows={1}
              />
            )}
          </div>

          {!isPartnerLeft && (
            <button
              className={`h-full w-20 text-black rounded-full shadow-md button-theme ${
                newMessage === "" ? "bg-red-200 text-sm" : "text-purple-600"
              }`}
              onClick={() => {
                if (newMessage === "") {
                  if (window.confirm("Are you sure you want to leave?")) {
                    handleLeave();
                  }
                } else {
                  sendMessage();
                }
              }}
            >
              {newMessage === "" ? "STOP" : "SEND"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
