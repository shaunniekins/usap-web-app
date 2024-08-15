"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../../../utils/supabase";

interface TypingIndicatorProps {
  roomId: string;
  userId: string;
}

interface Payload {
  userId: string;
}

interface BroadcastPayload {
  type: "broadcast";
  event: string;
  payload: { [key: string]: any };
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export const useTypingIndicator = ({
  roomId,
  userId,
}: TypingIndicatorProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [payload, setPayload] = useState<Payload | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newChannel = supabase.channel(`typing:${roomId}`);

    const onTyping = (broadcastPayload: BroadcastPayload) => {
      const typingPayload = broadcastPayload.payload as Payload;
      setPayload(typingPayload);
      setIsTyping(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    };

    newChannel.on("broadcast", { event: "typing" }, onTyping);
    const subscription = newChannel.subscribe();

    channelRef.current = newChannel;

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [roomId, userId]);

  const throttledTypingEvent = useCallback(
    throttle(() => {
      if (!channelRef.current) return;
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId },
      });
    }, 1000),
    [userId]
  );

  const sendTypingEvent = useCallback(() => {
    throttledTypingEvent();
  }, [throttledTypingEvent]);

  return { payload, isTyping, sendTypingEvent };
};
