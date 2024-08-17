"use client";

import LegalPolicyComponent from "@/components/LegalPolicy";
import { LoadingScreen } from "@/components/Loading";
import privacyPolicy from "@/data/privacy-policy.json";
import { useSessionCheck } from "@/hooks/useSessionCheck";

export default function Privacy() {
  const userId = useSessionCheck();

  if (!userId) {
    return <LoadingScreen />;
  }

  return <LegalPolicyComponent policy={privacyPolicy} />;
}
