import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY } from "@/components/legal/legal-content";

export const metadata: Metadata = {
  title: `${PRIVACY.title} — AI Weavers`,
  description: PRIVACY.description,
};

export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} other={{ label: "Terms of Service", href: "/terms" }} />;
}
