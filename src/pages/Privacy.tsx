import { LegalShell, type LegalSection } from "@/components/LegalShell";

/**
 * Privacy policy for DhruvaTwin.
 *
 * Written against what the product really stores: an account, the operational
 * records an operator writes, a rolling telemetry window, a local offline
 * queue, and the third parties the platform actually talks to (Convex, the
 * public HiveMQ broker, Groq for the assistant, Open-Meteo for weather and
 * Google for map embeds).
 */
const SECTIONS: LegalSection[] = [
  {
    id: "summary",
    heading: "Summary",
    paragraphs: [
      "We collect what the platform needs to work: your email to sign you in, the records you write (notes, logs, check-ins, wildlife sightings, drill results), and basic usage data. We do not run advertising trackers, we do not sell data, and we do not read your content except to show it back to you and to run the features you ask for.",
      "Questions you put to the assistant are sent to our AI provider together with station context. Some messages travel over a public MQTT broker so that the offline queue can be delivered. The rest of this policy sets out the detail.",
    ],
  },
  {
    id: "collect",
    heading: "Information we collect",
    paragraphs: ["We collect the following categories:"],
    bullets: [
      "Account data: your email address and sign-in method (one-time code or guest session), plus your role view if an administrator assigns one.",
      "Content you create: station notes and comments, maintenance logs, check-ins and SOS messages, wildlife sightings, cascade drill records, repair records and export requests.",
      "Operational data: telemetry simulated for the stations, alerts raised from it, and the hash-chained audit entries that record what was done in the platform.",
      "Device data: your station selection, view settings, achievements and the offline outbox queue, stored locally in your browser using local storage and IndexedDB until the queue is delivered.",
      "Technical data: IP address, browser and timestamp captured by our hosting provider for security and error diagnosis.",
    ],
  },
  {
    id: "use",
    heading: "How we use it",
    paragraphs: [
      "We use this information to provide the service: to authenticate you, render your stations, keep the twin in step with your work, deliver offline messages when the link returns, and keep an auditable record of operational actions.",
      "We also use it to keep the service secure, to diagnose faults, and to answer support questions you raise. We do not use your content for advertising and we do not build profiles of you for sale.",
    ],
  },
  {
    id: "basis",
    heading: "Legal basis",
    paragraphs: [
      "Where data protection law requires a basis, we rely on the performance of a contract to provide the platform you signed up for, your consent where you choose to use an optional feature such as the assistant, and legitimate interests for securing and improving the service.",
    ],
  },
  {
    id: "share",
    heading: "Who we share it with",
    paragraphs: [
      "We share only what each provider needs to do its job:",
    ],
    bullets: [
      "Convex: hosting, database and authentication for the platform itself.",
      "HiveMQ community broker: a public MQTT message broker used to carry telemetry, alerts, check-ins and the offline queue. Messages published to a public broker can be seen by the broker operator while in transit; payloads carry station readings and device identifiers, not your password.",
      "Groq: runs the assistant's language model. Your question, the model answer and limited station context are sent to it when you use the assistant.",
      "Open-Meteo: receives station coordinates only, to fetch public weather forecasts.",
      "Google Maps: map embeds and external links on the resupply screen. Opening these follows Google's own terms and privacy policy.",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies and local storage",
    paragraphs: [
      "We use only what is needed to keep you signed in and to remember your preferences: authentication cookies set by our own backend, plus local storage and IndexedDB entries for settings, achievements and the offline outbox. There are no advertising or cross-site tracking cookies.",
    ],
  },
  {
    id: "retention",
    heading: "Retention",
    paragraphs: [
      "Telemetry is held in a rolling window and old readings are pruned automatically, so only recent history stays in the queryable store. Audit, drill, repair, export and sighting records are kept so that the history they describe remains verifiable, and are deleted on request where the law requires it.",
      "Your account is kept while it is active. Ask us to delete it and we will remove the account record and your personal content, leaving only entries that the law or the audit chain requires to be preserved.",
      "Data in the local offline queue stays on your device until it is delivered or you clear it from the sync panel.",
    ],
  },
  {
    id: "security",
    heading: "Security",
    paragraphs: [
      "Access is protected by one-time codes rather than passwords, the transport is encrypted, audit records are hash-chained so that edits are detectable, and secrets are held as deployment keys rather than in the code. No system is perfectly secure; we investigate and disclose incidents when we become aware of them.",
    ],
  },
  {
    id: "transfers",
    heading: "International transfers",
    paragraphs: [
      "Our hosting and providers operate internationally, so your data may be processed outside India. Where it is, we rely on the providers' contractual safeguards and on your consent to the transfer.",
    ],
  },
  {
    id: "rights",
    heading: "Your rights",
    paragraphs: [
      "Subject to applicable law, you can ask us for a copy of the personal data we hold about you, correct it, delete it, restrict or object to how we use it, and withdraw consent for optional features. You can also export datasets you created from the compliance centre at any time.",
      "To exercise any of these rights, contact us through the workspace. We respond within a reasonable period and will not treat you differently for asking.",
    ],
  },
  {
    id: "children",
    heading: "Children",
    paragraphs: [
      "The platform is aimed at students, researchers and operators, and is not directed at children under 13. If you believe a child has given us personal data, contact us and we will remove it.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this policy as the platform changes. The date at the top of this page shows when it was last updated. Material changes will be highlighted on the landing page.",
    ],
  },
];

export default function Privacy() {
  return (
    <LegalShell
      current="privacy"
      title="Privacy Policy"
      updated="27 September 2026"
      lede="What we collect when you use DhruvaTwin, why we collect it, who we share it with, and the choices you have. Written in plain language, against what the platform actually does."
      sections={SECTIONS}
    />
  );
}
