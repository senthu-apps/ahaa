/**
 * Privacy Policy and Terms of Service copy for /privacy and /terms.
 * Written from what the site actually does today (booking via LunaCal,
 * form delivery via Resend, video on Bunny CDN, no analytics or ad cookies).
 * Update these when that changes, and have counsel review before launch.
 */

export type LegalBlock = string | { list: string[] };
export type LegalSection = { id: string; heading: string; body: LegalBlock[] };
export type LegalDoc = {
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const CONTACT = {
  company: "AI Weavers, a Scale Shift Ventures company",
  address: "7030 Woodbine Avenue, Suite 500, Markham, ON L3R 6G2, Canada",
  email: "hello@aiweavers.com",
  phone: "1-800-946-9778",
};

const contactBlock: LegalBlock[] = [
  `${CONTACT.company}`,
  `${CONTACT.address}`,
  `Email: ${CONTACT.email} · Phone: ${CONTACT.phone}`,
];

export const PRIVACY: LegalDoc = {
  title: "Privacy Policy",
  description: "How AI Weavers collects, uses and protects the personal information you share through aiweavers.com.",
  updated: "November 11, 2026",
  intro:
    "This policy explains what personal information AI Weavers (“we”, “us”) collects when you use aiweavers.com, why we collect it, who we share it with and the choices you have. We handle personal information in line with Canada’s Personal Information Protection and Electronic Documents Act (PIPEDA).",
  sections: [
    {
      id: "what-we-collect",
      heading: "What we collect",
      body: [
        "We only collect what you choose to give us, plus the basic technical data any website receives.",
        {
          list: [
            "Booking a call: your first and last name, email address, company, what you would like to automate, and the business details you add (industry, role, team size, tools you use, main pain points), plus the time you pick.",
            "Contact and estimate forms: your name, email address, company, your message, and the values you set in the cost calculator.",
            "Technical data: your IP address, browser type and the pages you request, recorded in standard server and security logs by our hosting and delivery providers.",
          ],
        },
        "Please don’t send us sensitive information (health, financial account or government ID details) through the website.",
      ],
    },
    {
      id: "how-we-use",
      heading: "How we use it",
      body: [
        {
          list: [
            "To schedule and run the call you booked, and send you the calendar invite and reminders.",
            "To reply to your message or estimate request and prepare for our conversation.",
            "To send you a copy of what you submitted.",
            "To keep the site secure, prevent abuse and fix problems.",
          ],
        },
        "We don’t sell your personal information, and we don’t use it for advertising. We only email you about your enquiry unless you ask to hear more.",
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and tracking",
      body: [
        "The site does not use advertising or analytics cookies. Our providers may set strictly necessary cookies (for example, to protect against abuse). If we add analytics later, we’ll update this policy and ask for your consent where required.",
      ],
    },
    {
      id: "sharing",
      heading: "Who we share it with",
      body: [
        "We share personal information only with service providers that help us run the site, under agreements that limit their use of it to providing their service to us:",
        {
          list: [
            "LunaCal, to show availability and book calls.",
            "Google (Calendar and Meet), to send invites and host the call.",
            "Resend, to deliver form submissions and confirmation emails.",
            "Bunny.net, to stream the video on our homepage.",
            "Our website hosting provider.",
          ],
        },
        "Some of these providers store data outside Canada, including in the United States. Information held there is subject to the laws of that country. We may also disclose information if the law requires it, or as part of a sale or reorganisation of our business.",
      ],
    },
    {
      id: "retention",
      heading: "How long we keep it",
      body: [
        "We keep enquiry and booking details for as long as we need them to talk with you and, if we work together, for the length of the engagement. If we don’t work together, we delete them within 24 months of our last contact unless the law requires us to keep them longer.",
      ],
    },
    {
      id: "security",
      heading: "How we protect it",
      body: [
        "Data travels over encrypted connections (HTTPS), access is limited to the people who need it, and we choose providers with strong security practices. No system is perfectly secure, so we can’t guarantee absolute security, but we will tell you and the Privacy Commissioner of Canada if a breach creates a real risk of significant harm to you.",
      ],
    },
    {
      id: "your-rights",
      heading: "Your choices and rights",
      body: [
        "You can ask to see the personal information we hold about you, correct it, or withdraw consent and have it deleted. Email us at " +
          CONTACT.email +
          " and we’ll respond within 30 days. If you’re not satisfied with our answer, you can contact the Office of the Privacy Commissioner of Canada (priv.gc.ca).",
      ],
    },
    {
      id: "children",
      heading: "Children",
      body: ["The site is for businesses. We don’t knowingly collect information from anyone under 16."],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      body: [
        "We’ll post any changes on this page and update the date at the top. If a change is significant, we’ll make it clear on the site.",
      ],
    },
    {
      id: "contact",
      heading: "Contact us",
      body: ["Questions or requests about your privacy can go to our privacy contact:", ...contactBlock],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: "Terms of Service",
  description: "The terms that apply when you use aiweavers.com, book a call or request an estimate.",
  updated: "November 11, 2026",
  intro:
    "These terms apply to your use of aiweavers.com (the “site”), run by AI Weavers, a Scale Shift Ventures company (“we”, “us”). By using the site you agree to them. If you don’t agree, please don’t use the site.",
  sections: [
    {
      id: "the-site",
      heading: "What the site is for",
      body: [
        "The site describes our AI automation, agent and custom software services and lets you book a call or send us an enquiry. Any work we do for you is covered by a separate written agreement, and that agreement takes priority over these terms.",
      ],
    },
    {
      id: "estimates",
      heading: "Prices, estimates and calculators",
      body: [
        "Prices, plans, timelines and the results of the cost calculator are general information to help you plan. They are not an offer or a quote. Your actual scope, price and schedule are set in a written proposal or agreement.",
        "Examples, use cases and figures about time or money saved are illustrations. Results depend on your business, your systems and how the work is used.",
      ],
    },
    {
      id: "bookings",
      heading: "Booking a call",
      body: [
        "When you book, you agree to give accurate details. You can reschedule or cancel from your calendar invite. We may cancel or move a call if we need to, and we’ll let you know by email.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "Using the site responsibly",
      body: [
        "You agree not to:",
        {
          list: [
            "send spam, false information or someone else’s details through our forms;",
            "try to break, overload or get unauthorised access to the site or the systems behind it;",
            "scrape or copy the site in bulk, or use it to build a competing service;",
            "use the site for anything unlawful.",
          ],
        },
      ],
    },
    {
      id: "ip",
      heading: "Our content",
      body: [
        "The site’s text, design, graphics, video and code belong to us or our licensors. You may view and share pages for your own business purposes, but you may not copy, change or republish them without our written permission. Third-party names and logos shown on the site belong to their owners and are used only to identify the tools we work with; their use doesn’t imply endorsement.",
      ],
    },
    {
      id: "third-parties",
      heading: "Third-party services and links",
      body: [
        "The site uses third-party services (such as our scheduling and email providers) and may link to other websites. We aren’t responsible for their content or practices, and their own terms apply.",
      ],
    },
    {
      id: "disclaimer",
      heading: "No warranty",
      body: [
        "We work to keep the site accurate and available, but it is provided “as is” and “as available”. To the extent the law allows, we make no warranties about it, including that it will be error-free or uninterrupted. Nothing on the site is legal, financial or tax advice.",
      ],
    },
    {
      id: "liability",
      heading: "Limit of liability",
      body: [
        "To the extent the law allows, we aren’t liable for indirect, incidental or consequential losses, or for lost profits, revenue or data, arising from your use of the site. Our total liability for any claim about the site is limited to CAD $100. This doesn’t limit liability that can’t be limited by law.",
      ],
    },
    {
      id: "privacy",
      heading: "Privacy",
      body: ["Our Privacy Policy explains how we handle the personal information you share through the site."],
    },
    {
      id: "law",
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of the Province of Ontario and the federal laws of Canada that apply there. Any dispute will be heard in the courts of Ontario.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to these terms",
      body: [
        "We may update these terms from time to time. We’ll post the new version here with a new date. Continuing to use the site after that means you accept the updated terms.",
      ],
    },
    {
      id: "contact",
      heading: "Contact us",
      body: ["Questions about these terms:", ...contactBlock],
    },
  ],
};
