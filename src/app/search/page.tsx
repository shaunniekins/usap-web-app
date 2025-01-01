"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  db,
  getUserByUUID,
  updateUser,
  createChatSession,
} from "@/lib/firebase";
import { User } from "@/types";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  runTransaction,
} from "firebase/firestore";
import SearchingText from "@/components/SearchingText";

export default function Search() {
  const router = useRouter();
  const uuid =
    typeof window !== "undefined" ? localStorage.getItem("uuid") : null;

  const handleCancel = async () => {
    if (!uuid) return;
    const userDoc = await getUserByUUID(uuid);
    if (userDoc?.id) {
      await updateUser(userDoc.id, {
        is_searching: false,
      });
      router.push("/");
    }
  };

  useEffect(() => {
    if (!uuid) {
      router.push("/");
      return;
    }

    const checkUserStatus = async () => {
      const userDoc = await getUserByUUID(uuid);
      if (!userDoc?.id) {
        router.push("/");
        return;
      }

      if (userDoc.current_session) {
        const sessionRef = doc(db, "chatSessions", userDoc.current_session);
        const sessionSnap = await getDoc(sessionRef);

        if (sessionSnap.exists()) {
          router.push(`/${userDoc.current_session}`);
          return;
        } else {
          // If session doesn't exist, clear user's session
          await updateUser(userDoc.id, {
            current_session: null,
            is_searching: false,
          });
        }
      }

      // Continue with search process
      await updateUser(userDoc.id, {
        is_searching: true,
        last_seen: new Date(),
      });
    };

    checkUserStatus();

    const searchInterval = setInterval(async () => {
      try {
        // Get current user with type assertion
        const userDoc = await getUserByUUID(uuid);
        if (!userDoc?.id) {
          router.push("/");
          return;
        }

        // Now TypeScript knows userDoc has the correct properties
        if (userDoc.current_session) {
          router.push(`/${userDoc.current_session}`);
          return;
        }

        // Wrap the pairing logic in a transaction
        await runTransaction(db, async (transaction) => {
          // Get fresh user data within transaction
          const currentUserRef = doc(db, "users", userDoc.id);
          const currentUserSnap = await transaction.get(currentUserRef);

          if (!currentUserSnap.exists()) return;
          const currentUserData = currentUserSnap.data() as User;

          // If user is already in session or not searching, abort
          if (
            currentUserData.current_session ||
            !currentUserData.is_searching
          ) {
            return;
          }

          // Find other searching users
          const usersRef = collection(db, "users");
          const q = query(
            usersRef,
            where("is_searching", "==", true),
            where("uuid", "!=", uuid),
            where("current_session", "==", null)
          );

          const querySnapshot = await getDocs(q);
          const availableUser = querySnapshot.docs[0];

          if (availableUser) {
            // Verify the other user's status within transaction
            const otherUserRef = doc(db, "users", availableUser.id);
            const otherUserSnap = await transaction.get(otherUserRef);

            if (!otherUserSnap.exists()) return;
            const otherUserData = otherUserSnap.data() as User;

            // Double-check the other user is still available
            if (!otherUserData.current_session && otherUserData.is_searching) {
              // Create new session
              const sessionRef = doc(collection(db, "chatSessions"));
              const sessionData = {
                users: [uuid, availableUser.data().uuid],
                created_at: new Date(),
                active: true,
              };

              // Update all documents atomically
              transaction.set(sessionRef, sessionData);
              transaction.update(currentUserRef, {
                is_searching: false,
                current_session: sessionRef.id,
              });
              transaction.update(otherUserRef, {
                is_searching: false,
                current_session: sessionRef.id,
              });

              // Navigate after successful transaction
              router.push(`/${sessionRef.id}`);
            }
          }
        });
      } catch (error) {
        console.error("Error in search:", error);
      }
    }, 2000);

    // Cleanup: Set user as not searching when component unmounts
    return () => {
      clearInterval(searchInterval);
      if (uuid) {
        getUserByUUID(uuid).then((userDoc) => {
          if (userDoc && userDoc.is_searching) {
            updateUser(userDoc.id, { is_searching: false });
          }
        });
      }
    };
  }, [uuid, router]);

  return (
    <div className="screen-container">
      <div className="h-full w-full flex flex-col items-center">
        <div className="top-0 left-0 absolute">
          <button
            className="text-sm text-gray-400 pt-5 pl-5 pb-8 pr-8"
            onClick={handleCancel}
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <SearchingText />
        </div>
      </div>
    </div>
  );
}
