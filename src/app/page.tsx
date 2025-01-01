"use client";

import { useRouter } from "next/navigation";
import { getUserByUUID, createUser, updateUser } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MdOutlineHandshake } from "react-icons/md";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      const uuid = localStorage.getItem("uuid");
      if (uuid) {
        const userDoc = await getUserByUUID(uuid);
        if (userDoc) {
          if (userDoc.current_session) {
            router.push(`/${userDoc.current_session}`);
          } else if (userDoc.is_searching) {
            router.push("/search");
          }
        }
      }
    };

    checkUserStatus();
  }, [router]);

  const handleStart = async () => {
    let uuid = localStorage.getItem("uuid");

    if (!uuid) {
      uuid = uuidv4();
      localStorage.setItem("uuid", uuid);
    }

    // Check for existing session before proceeding
    const existingUser = await getUserByUUID(uuid);
    if (existingUser?.current_session) {
      router.push(`/${existingUser.current_session}`);
      return;
    }

    if (!existingUser) {
      await createUser(uuid);
    } else {
      await updateUser(existingUser.id, {
        is_searching: false,
        current_session: null,
        last_seen: new Date(),
      });
    }

    router.push(`/search`);
  };

  return (
    <div className="screen-container">
      {/* <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">usap</h1>
        <button
          onClick={handleStart}
          className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-600 transition-colors"
        >
          Start Chatting
        </button>
      </div> */}

      <div className="h-full w-full flex flex-col items-center">
        <Navbar callFeature={true} />
        <div className="h-full flex justify-center items-center">
          <button
            className="p-5 bg-purple-700 rounded-full overflow-hidden shadow-xl shadow-purple-500 drop-shadow-2xl active:scale-95 active:shadow-lg"
            onClick={handleStart}
          >
            <MdOutlineHandshake size={130} color="white" />
          </button>
        </div>
        <p className="text-gray-400 text-sm bottom-16 absolute">Tap to start</p>
      </div>
    </div>
  );
}
