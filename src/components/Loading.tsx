"use client";

import { ReactNode } from "react";
import { useSessionCheck } from "@/hooks/useSessionCheck";
import Image from "next/image";

interface LoadingScreenProps {
  children: ReactNode;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ children }) => {
  const userId = useSessionCheck();

  if (!userId) {
    return (
      <div className="z-10 flex w-screen h-[100svh] justify-center items-center p-5">
          <Image
            src="/logo-usap.gif"
            alt="Logo"
            width={150}
            height={150}
          />
      </div>
    );
  }

  return <>{children}</>;
};
