import { LegalShell, type LegalSection } from "@/components/LegalShell";

/**
 * Terms and conditions for DhruvaTwin.
 *
 * Written for what the product actually is: a research and education digital
 * twin of the Indian Antarctic stations, run as a prototype with simulated
 * sensor data, so nobody reads it as an operational safety system.
 */
const SECTIONS: LegalSection[] = [
  {
    id: "service",
    heading: "What DhruvaTwin is",
    paragraphs: [
      "DhruvaTwin is a digital twin platform for the Indian Antarctic stations Maitri and Bharati, built by Team HackFinity007 for Smart India Hackathon 2026 under problem statement 26060 with the National Centre for Polar and Ocean Research, Ministry of Earth Sciences. It models the station environments, sensors, plant, interiors, wildlife and logistics for training, research, demonstration and education.",
      "The platform is a prototype. Sensor channels, plant behaviour, wildlife placement, voyages and forecasts presented in the twin are simulated or modelled for demonstration unless a screen explicitly states that a value comes from a live public source.",
    ],
  },
  {
    id: "acceptance",
    heading: "Acceptance of these terms",
    paragraphs: [
      "By creating an account, signing in as a guest, or otherwise using DhruvaTwin, you agree to these terms and to our Privacy Policy. If you do not agree, do not use the service.",
      "If you use DhruvaTwin on behalf of an institution, you confirm that you are authorised to accept these terms for that institution.",
    ],
  },
  {
    id: "accounts",
    heading: "Accounts and access",
    paragraphs: [
      "Access is granted by a one-time code sent to your email, or by a temporary guest session. You are responsible for activity carried out under your account and for keeping your email account secure.",
      "Guest sessions are temporary and device-local; work saved only in a guest session may be lost when that session ends.",
    ],
  },
  {
    id: "use",
    heading: "Acceptable use",
    paragraphs: [
      "You agree not to misuse the service. In particular you must not:",
    ],
    bullets: [
      "attempt to gain access to another user's account, or to the underlying deployment, outside the interface;",
      "publish unlawful, abusive, deceptive or infringing content through notes, logs, check-ins or the assistant;",
      "interfere with the service, including flooding the shared MQTT message broker, the assistant or the deployment with requests;",
      "reverse engineer or resell the service, or remove attribution from exported datasets;",
      "present the platform as an official system of NCPOR, MoES or the Government of India.",
    ],
  },
  {
    id: "data",
    heading: "Simulated, modelled and third-party data",
    paragraphs: [
      "Unless a screen says otherwise, readings shown in the twin are produced by the platform's own simulation. Weather is provided by Open-Meteo from public model data, satellite imagery links and map embeds are provided by Google, and MQTT messaging uses a public HiveMQ community broker. Wildlife species cards are written from published field references and are for information only.",
      "Third-party services are governed by their own terms and privacy policies. We do not control their availability or accuracy.",
    ],
  },
  {
    id: "reliance",
    heading: "No operational reliance",
    paragraphs: [
      "DhruvaTwin must not be used as the sole basis for any safety, navigation, engineering or operational decision, and it is not connected to the real Maitri or Bharati stations. For anything that matters, rely on the official record held by NCPOR and on the Antarctic Treaty system, and follow station standing orders.",
      "Nothing on the platform constitutes professional engineering, medical, meteorological or legal advice.",
    ],
  },
  {
    id: "assistant",
    heading: "The station assistant",
    paragraphs: [
      "The assistant is an AI feature that answers using live station context and a general language model hosted by Groq. Its answers can be wrong, incomplete or out of date, and they are not a substitute for the record. Do not paste personal, sensitive or classified information into a question.",
    ],
  },
  {
    id: "ip",
    heading: "Intellectual property",
    paragraphs: [
      "The DhruvaTwin platform, its interface, models, copy and code remain the property of the team that built it. Data sets you export may be reused within the terms stated on each export record.",
      "Names and marks belonging to NCPOR, MoES, the Government of India, Smart India Hackathon, and to any service we link to remain the property of their owners and imply no endorsement.",
      "Feedback you send may be used to improve the platform without obligation to you.",
    ],
  },
  {
    id: "availability",
    heading: "Availability, offline mode and changes",
    paragraphs: [
      "The platform is offered as available, without guarantee of uptime. An offline outbox stores work locally and forwards it when the link returns, but data held only on your device can be lost if you clear site storage before it is sent.",
      "We may add, change or withdraw features, screens and datasets at any time. We may suspend or withdraw access to deal with abuse, security incidents or legal requirements.",
    ],
  },
  {
    id: "liability",
    heading: "Disclaimer and limitation of liability",
    paragraphs: [
      "The service is provided as is and as available, without warranties of any kind, express or implied, including accuracy, completeness, fitness for a particular purpose and non-infringement.",
      "To the fullest extent permitted by law, the team behind DhruvaTwin is not liable for any indirect, incidental, special, consequential or punitive loss, or for loss of data, profit or goodwill, arising from your use of the service. Nothing in these terms excludes liability that cannot be excluded under applicable law.",
    ],
  },
  {
    id: "law",
    heading: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of India, and the courts of India have exclusive jurisdiction over any dispute arising from them. If any provision is held unenforceable, the remaining provisions continue in effect.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms as the platform changes. The date at the top of this page shows when they were last updated. Continuing to use DhruvaTwin after a change means you accept the updated terms; if you do not accept them, stop using the service.",
    ],
  },
];

export default function Terms() {
  return (
    <LegalShell
      current="terms"
      title="Terms and Conditions"
      updated="27 September 2026"
      lede="The rules for using DhruvaTwin: what the platform is, what it is not, and what you can expect from us. Please read these before using the command centre."
      sections={SECTIONS}
    />
  );
}
