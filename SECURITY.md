# Security

DhruvaTwin is a demonstration platform for the Indian Antarctic research stations Maitri and
Bharati. It holds no real station data, but it does hold accounts, user content and provider
credentials, so the security model is written down rather than assumed.

## Reporting a vulnerability

Do not open a public issue and do not test the deployment without permission. Report privately to
Team HackFinity007 through the workspace inside the platform, with the screen, the steps and what
you observed. We will confirm receipt, investigate, fix what is ours to fix, and credit you if you
want credit. There is no bug bounty.

## How provider keys are handled

The rule is one sentence long: **no credential ever reaches the browser.**

- Every provider key is read from `process.env` inside a Convex action marked `"use node"`. Convex
  bundles and runs those files on the backend, so the value exists only in the server process.
- Nothing under `src/` reads a key. The only variables the browser sees are Vite's own
  `VITE_`-prefixed values, which are public by definition, and in this project they are just the
  Convex deployment URL and the platform's own app and monitoring identifiers. There is no
  `VITE_`-prefixed provider key anywhere in the code.
- Keys are set through the platform's **Keys / API keys** UI. They live in the deployment
  environment, not in the repository, and they are never echoed back to a caller: the assistant and
  the advisor report only *which model* answered, never the credential behind it.
- The AI features fail safe. With no key configured the console answers from a deterministic rule
  engine over the same live data instead of falling back to an unauthenticated call or an error,
  and it says so on screen.

## Guard rails in the repository

- `.gitignore` blocks every credential file shape, including `.env`, `.env.*` (with `.env.example`
  kept), `*.pem`, `*.key`, `*.p12`, `*.pfx` and common service-account file names. If a key file was
  ever committed before these rules existed, it is still in git history and must be rotated:
  `git rm --cached <file>` stops tracking it going forward, but the value itself has to be replaced
  at the provider.
- `bun run scan:secrets` scans the source tree for credential-shaped literals, including Groq,
  OpenAI, Anthropic, Google, AWS, GitHub, Stripe and Slack key formats, private key blocks, bearer
  literals and assigned secret strings. It exits non-zero on a finding, so it can be wired into a
  pre-commit hook or a CI step. It currently reports one reviewed literal: the template's shared
  one-time-code relay credential in the auth provider, which is a relay identity rather than a
  project secret.

## Application security in the platform

- **Authentication**: Convex Auth with email one-time codes, plus anonymous guest sessions. There
  are no stored passwords anywhere, so there is no password hash to steal or reuse.
- **Authorisation**: protected routes are wrapped in `RequireAuth`, which preserves the requested
  path and sends signed-out users to `/auth`. Role views (Admin, Commander, Scientist, Station)
  filter navigation and gate actions.
- **Data**: every mutation validates its arguments with Convex validators, so the database only
  accepts the shapes the schema declares. Alert, repair, drill, export and sighting writes are
  attributed to the signed-in user.
- **Tamper evidence**: operational actions are written to a rolling hash chain, and the Audit Trail
  screen recomputes the digests, so an edit, insertion or reordering of history is detectable rather
  than silent.
- **Transport**: everything is served over HTTPS/WSS. MQTT runs over `wss://` on the public HiveMQ
  broker, which is a demonstration transport: payloads carry station readings, queue identifiers and
  device identifiers, never an account credential.
- **Offline queue**: outbound messages are buffered in IndexedDB with priority classes and replay
  highest-priority-first. The queue lives in the browser and is cleared when the operator clears it
  or the session ends.
- **Third parties**: the browser talks to Convex, the public MQTT broker and the keyless map embeds.
  The AI provider is reached only from the backend. Each of these is named in the Privacy Policy,
  and each is disclosed in the console, not hidden behind a proxy.
- **Failure isolation**: the 3D viewport, the assistant and the offline panel each sit behind an
  error boundary, so a fault in one does not take the console down.
- **AI output**: model answers and advisor briefings are validated before use. The advisor parses
  and shape-checks the model's JSON and discards anything malformed, and both features state which
  engine produced an answer.

## What this platform is not

It is a hackathon prototype, not an operational system. It is not connected to the real stations, it
does not control real equipment, and it must not be used for navigation, clearance, life-safety or
any other professional decision. See the Terms and Conditions at `/terms` for the full position.

## Out of scope here

Hosting-level controls (WAF rules, TLS termination, DDoS protection, log retention, backup policy)
belong to the platform that serves the deployment and are not configured from this repository.
Content Security Policy headers are likewise set by the host; the application does not inject
remote scripts, and every external resource it uses is an explicit, named embed or link.
