/**
 * Instant assistant replies.
 *
 * Meta questions and console how-to questions do not need a model or a round
 * trip, and waiting a second for "hello" is what makes an assistant feel slow.
 * These are answered locally, immediately, while anything that needs live
 * station data or general knowledge goes to the assistant action.
 */

export interface FastReply {
  answer: string;
  /** Label shown under the bubble. */
  model: string;
}

interface Rule {
  id: string;
  /** Patterns that match the question. */
  match: RegExp[];
  answer: (question: string) => string;
}

const RULES: Rule[] = [
  {
    id: "greeting",
    match: [/^\s*(hi|hey|hello|yo|namaste|good (morning|afternoon|evening))\b/i],
    answer: (question) =>
      [
        `Hello. I am the DhruvaTwin assistant, and I can help with two kinds of question.`,
        `- Station operations: readiness, incidents, continuity risk, power, water, weather limits, telemetry repair and the cascade drill.`,
        `- General knowledge: polar science, Antarctic history, engineering, definitions, and anything else you want explained. Ask me ${question.trim().endsWith("?") ? "anything else" : "away"}.`,
      ].join("\n"),
  },
  {
    id: "thanks",
    match: [/^\s*(thanks|thank you|cheers|great, thanks|shukriya)\b/i],
    answer: () => "Any time. Ask again whenever you want the station picture, a procedure, or something explained from first principles.",
  },
  {
    id: "identity",
    match: [/who are you|what are you\b|your name|are you (an? )?(ai|bot|human)/i],
    answer: () =>
      [
        "I am the station assistant inside DhruvaTwin, the digital twin console for the Indian Antarctic stations Maitri and Bharati, built for NCPOR under the Ministry of Earth Sciences.",
        "- I answer from live station context when the question is operational.",
        "- I answer from general knowledge when the question is not, so you can ask about polar science, engineering or history without leaving the console.",
        "- With a Groq key configured I run on llama-3.3-70b-versatile; without one I fall back to a local rule engine over the same live context, which is why the console stays usable offline.",
      ].join("\n"),
  },
  {
    id: "capabilities",
    match: [/what can you do|how can you help|what do you do|help me|^help$/i],
    answer: () =>
      [
        "Assessment: I read the live station context and answer questions over it, and I answer general questions too.",
        "- Operations: continuity and blackout risk, open incidents by severity, microgrid headroom, water path, weather limits, personnel state.",
        "- Maintenance: telemetry repair procedures in the repair bay, and the FPGA self-healing self-test verdicts.",
        "- Resilience: cascade drill results, which node is reached next, and the isolation plan that buys the most time.",
        "- Logistics: resupply voyage position, cargo and noon reports for the sea lift from Cape Town.",
        "- General: any question outside the station, answered normally rather than forced into a template.",
      ].join("\n"),
  },
  {
    id: "walk-inside",
    match: [/walk inside|enter the station|go inside|interior|walk mode/i],
    answer: () =>
      [
        "To walk the station: open the Digital Twin, switch the view to Interior, then click into the canvas to take the pointer.",
        "- WASD moves, mouse looks, Shift sprints, Space jumps, and Esc releases the pointer.",
        "- Doors open as you approach them, and clicking a fixture with the crosshair opens its detail panel.",
        "- The interior toggle also gives the overhead deck plan if you want the whole floor at once.",
      ].join("\n"),
  },
  {
    id: "drone",
    match: [/drone|tour|fly ?over|show ?me around/i],
    answer: () =>
      [
        "Drone tour: on the Digital Twin, choose Drone Tour in the view selector.",
        "- The drone flies a scripted route over the station and narrates every stop with the real facts behind it.",
        "- You get pause, previous, next, restart and half, normal or double speed.",
        "- Take control at any time: switch back to Exterior and the camera is yours again, free to orbit, pan and zoom.",
      ].join("\n"),
  },
  {
    id: "free-camera",
    match: [/camera (stuck|snap|return)|free view|orbit|why does the camera/i],
    answer: () =>
      [
        "The camera is free by default. Choosing a preset flies it there once and then releases it.",
        "- Drag to orbit, right-drag to pan, scroll to zoom.",
        "- If a preset is re-selected it flies again; otherwise nothing writes to the camera while you work.",
        "- Reset to overview from the Camera menu whenever you want the wide shot back.",
      ].join("\n"),
  },
  {
    id: "offline",
    match: [/offline|sync|queue|mqtt|broker/i],
    answer: () =>
      [
        "Offline sync works in three layers: the console keeps working, the outbound messages queue, and the queue drains in priority order when the link returns.",
        "- Priority order: SOS first, then critical telemetry, then check-ins, then routine traffic.",
        "- Queued items live in IndexedDB, so a page reload or a browser restart does not lose them.",
        "- The header shows ONLINE, SYNCING or OFFLINE with the number of queued items, and MQTT frames go out on the station topic tree.",
      ].join("\n"),
  },
  {
    id: "teleport",
    match: [/teleport|jump to|go to (a )?room|navigate/i],
    answer: () =>
      [
        "Teleport opens a directory of every place in the twin: both decks, every room, each water body, each vehicle and every exterior viewpoint.",
        "- Press T anywhere on the Digital Twin, or click the Teleport button.",
        "- Picking a room drops you into walk mode at that room's spawn point.",
        "- The minimap in the corner also teleports: click a marker on it.",
      ].join("\n"),
  },
  {
    id: "cascade-help",
    match: [/cascade/i],
    answer: () =>
      [
        "Cascade drill: open it from the left rail under Resilience.",
        "- Pick a trigger, set the severity, then tick the isolation points you would actually open.",
        "- The graph, the timeline and the response window update as you change the plan, because the propagation is computed rather than scripted.",
        "- Run and record the drill to store it and write an entry into the audit chain.",
      ].join("\n"),
  },
  {
    id: "repair-help",
    match: [/repair|self[- ]?heal|fpga/i],
    answer: () =>
      [
        "Repair bay: open it from the left rail under Resilience.",
        "- The fault queue lists channels that are out of band, dropped or drifting, each with the field procedure written out.",
        "- Applying a repair closes the matching incidents, writes a corrected sample back into the band, and records the work in the audit chain.",
        "- Below it, the FPGA self-test injects real bit flips into a triple-redundant bitstream, runs the voter and the scrubber, and reports PASS or FAIL with the numbers behind it.",
      ].join("\n"),
  },
  {
    id: "resupply-help",
    match: [/resupply|ship|voyage|cargo|sea lift/i],
    answer: () =>
      [
        "Resupply tracker: open it from the left rail under Logistics.",
        "- It tracks the sea lift from Cape Town to Bharati or Maitri with position, course, distance run, remaining passage and noon reports.",
        "- The satellite panel is a Google Maps embed centred on the ship, with one-click Google Earth and route links.",
        "- Cargo, vessel particulars and the discharge plan are on the same screen.",
      ].join("\n"),
  },
];

/**
 * Try to answer instantly.
 *
 * Returns null when the question needs live station data or real model
 * knowledge, in which case the caller sends it to the assistant action.
 */
export function fastReply(question: string): FastReply | null {
  const trimmed = question.trim();
  if (trimmed.length === 0) return null;
  for (const rule of RULES) {
    if (rule.match.some((pattern) => pattern.test(trimmed))) {
      return { answer: rule.answer(trimmed), model: `quick reply - ${rule.id}` };
    }
  }
  return null;
}
