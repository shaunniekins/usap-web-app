"use client";

import { deleteFromQueue } from "@/api/userQueue";
import SearchingText from "@/components/SearchingText";
import { useSessionCheck } from "@/hooks/useSessionCheck";
import { useRouter } from "next/navigation";

export default function Search() {
  const router = useRouter();
  const userId = useSessionCheck();

  return (
    <div className="screen-container">
      <div className="h-full w-full flex flex-col items-center">
        <div className="top-0 left-0 absolute">
          <button
            className="text-sm text-gray-400 pt-5 pl-5 pb-8 pr-8"
            onClick={() => {
              userId && deleteFromQueue(userId);
              router.push("/");
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
    </div>
  );
}
