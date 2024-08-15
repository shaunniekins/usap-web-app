import LegalPolicyComponent from "@/components/LegalPolicy";
import TermsAndConditionsPolicy from "@/data/terms-and-conditions.json";

export default function TermsAndConditions() {
  return <LegalPolicyComponent policy={TermsAndConditionsPolicy} />;
}
