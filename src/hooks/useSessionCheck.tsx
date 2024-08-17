// src/hooks/useSessionCheck.tsx

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { fetchSession } from "@/api/chatSession";
import { checkIdInQueue } from "@/api/userQueue";
import { v4 as uuidv4 } from "uuid";

export const useSessionCheck = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [isRerouteComplete, setIsRerouteComplete] = useState(false);

  useEffect(() => {
    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem("userId", storedUserId);
    }
    setUserId(storedUserId);
  }, []);

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
          router.push("/chat");
          setIsRerouteComplete(true);
          return;
        }

        const userExists = await checkIdInQueue(userId);

        if (!userExists && (pathname === "/search" || pathname === "/chat")) {
          router.push("/");
        } else if (userExists && pathname !== "/search") {
          router.push("/search");
        }

        setIsRerouteComplete(true);
      }
    };

    fetchAndSetAction();
  }, [userId, router, pathname]);

  useEffect(() => {
    if (userId) {
      const channel = supabase
        .channel("chat_sessions_in_featured")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chat_sessions",
          },
          (payload) => {
            if (
              (payload.eventType === "INSERT" ||
                payload.eventType === "UPDATE") &&
              userId !== null &&
              ((payload.new.user1_id === userId &&
                payload.new.user1_connection) ||
                (payload.new.user2_id === userId &&
                  payload.new.user2_connection))
            ) {
              router.push("/chat");
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
  }, [userId, router]);

  return isRerouteComplete ? userId : null;
};
