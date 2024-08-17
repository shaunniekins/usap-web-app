// src/app/components/Main.tsx

"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { MdOutlineHandshake } from "react-icons/md";
import Modal from "./ModalPoliciesConfirm";
import { useRouter } from "next/navigation";
import startSearch from "@/utils/searchService";
import { useSessionCheck } from "@/hooks/useSessionCheck";
import { LoadingScreen } from "./Loading";

const MainComponent = () => {
  const router = useRouter();
  const userId = useSessionCheck();

  // legal policies modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    const hasConfirmed = localStorage.getItem("userConfirmed");
    if (hasConfirmed === "true") {
      setIsModalOpen(false);
    } else {
      setIsModalOpen(true);
    }
  }, []);

  const handleModalConfirm = () => {
    localStorage.setItem("userConfirmed", "true");
    setIsModalOpen(false);
  };

  if (!userId) {
    return <LoadingScreen />;
  }

  return (
    <div className="screen-container">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
      <div className="h-full w-full flex flex-col items-center overflow-hidden">
        <Navbar callFeature={true} />
        <div className="h-full flex justify-center items-center">
          <button
            className="p-5 bg-purple-700 rounded-full overflow-hidden shadow-xl shadow-purple-500 drop-shadow-2xl active:scale-95 active:shadow-lg"
            onClick={() => userId && startSearch(userId, router)}
          >
            <MdOutlineHandshake size={130} color="white" />
          </button>
        </div>
        <p className="text-gray-400 text-sm bottom-16 absolute">Tap to start</p>
      </div>
    </div>
  );
};

export default MainComponent;
