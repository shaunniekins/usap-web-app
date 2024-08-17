"use client";

import FeaturedComponent from "@/components/Featured";
import { LoadingScreen } from "@/components/Loading";
import { useSessionCheck } from "@/hooks/useSessionCheck";

export default function Featured() {
  const userId = useSessionCheck();

  if (!userId) {
    return <LoadingScreen />;
  }

  return <FeaturedComponent />;
}
