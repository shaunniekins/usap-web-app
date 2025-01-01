import LegalPolicyComponent from "@/components/LegalPolicy";
import privacyPolicy from "../data/privacy-policy.json";

export default function Privacy() {
  return <LegalPolicyComponent policy={privacyPolicy} />;
}
