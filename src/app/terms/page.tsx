import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS } from "@/components/legal/legal-content";

export const metadata: Metadata = {
  title: `${TERMS.title} — AI Weavers`,
  description: TERMS.description,
};

export default function TermsPage() {
  return <LegalPage doc={TERMS} other={{ label: "Privacy Policy", href: "/privacy" }} />;
}
