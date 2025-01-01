"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TypingIndicatorProps {
  roomId: string;
  userId: string;
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const typingRef = doc(db, "typing_indicators", roomId);
    const unsubscribe = onSnapshot(typingRef, (doc) => {
      const data = doc.data();
      if (data && data.userId !== userId && data.timestamp) {
        setIsTyping(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [roomId, userId]);

  const updateTypingStatus = useCallback(async () => {
    if (!roomId) return;

    const typingRef = doc(db, "typing_indicators", roomId);
    await setDoc(typingRef, {
      userId,
      timestamp: serverTimestamp(),
    });
  }, [roomId, userId]);

  const throttledTypingEvent = useCallback(
    throttle(() => {
      updateTypingStatus();
    }, 1000),
    [updateTypingStatus]
  );

  const sendTypingEvent = useCallback(() => {
    throttledTypingEvent();
  }, [throttledTypingEvent]);

  return { isTyping, sendTypingEvent };
};
