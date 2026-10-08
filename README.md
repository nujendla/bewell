# BEINGWELL

Mobile-first Next.js / TypeScript fitness application. Original SVG athlete art, dark red interface, Supabase authentication and persistent user data, Gemini-assisted plans/photo estimates, and Razorpay recurring subscriptions.

## Development

Use the existing isolated checkout; do not create another worktree.

```sh
cd /workspace/bewell
npm ci --cache /workspace/.npm-cache
# Copy .env.example to .env.local and fill values securely; never commit secrets.
npm run dev
```

Node 22+ is required. Node 24 was used for validation. In production, `npm run build` then `npm start`. Public Supabase variables must be present **at build time**. Browser integration-error tests intentionally run with no Supabase configuration; do not run those assertions against a configured production instance.

## Supabase setup

1. Use a dedicated development Supabase project. Run `supabase/001_initial.sql` once in its SQL editor. It creates tables, policies, the private `body-photos` bucket, a database-backed rate limiter, and a unique open-subscription constraint, inside a transaction. Review before applying; this migration expects these application tables not to exist.
2. Enable email/password authentication and **Confirm email**. Configure reliable SMTP and recovery email delivery.
3. Set the Auth site URL to the Vercel Preview URL and allow its `/auth/callback` redirect. Add `/auth/callback?recover=1` for recovery. Add the production URLs only when releasing.
4. Configure the project URL and public anon key in the environment. The service-role key is server-only and is used solely for subscription writes. Never expose it with a `NEXT_PUBLIC_` prefix.

`profiles.preferences` holds onboarding preferences and fitness goals. `plans.data` holds versioned workout and nutrition plans together, preserving prior plans after regeneration. Separate tables hold meal, workout and weight logs, daily tasks, body-photo results, and subscriptions. All user tables have ownership RLS. Subscription mutation is denied to clients. Photos are private, owner-scoped and deletable even after Premium expires. Food photos are analyzed without persistent app storage. Onboarding drafts stay locally on the user's device until submitted.

## Environment variables

See `.env.example` for names. Enter values securely in cloud environment settings and separately in Vercel project environment settings. No values belong in chat, Git or setup scripts.

| Name                            | Purpose                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project HTTPS URL                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anon key; RLS protects data                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only subscription writes                             |
| `GEMINI_API_KEY`                | Server-only Google Gemini access                            |
| `GEMINI_MODEL`                  | Defaults to `gemini-2.5-flash`                              |
| `RAZORPAY_KEY_ID`               | Server-configured public checkout ID                        |
| `RAZORPAY_KEY_SECRET`           | Server-only API Basic authentication and payment HMAC       |
| `RAZORPAY_PLAN_ID`              | Plan for INR 9900 paise, interval 1, monthly                |
| `RAZORPAY_WEBHOOK_SECRET`       | Server-only webhook HMAC secret                             |
| `NEXT_PUBLIC_APP_URL`           | Deployment origin, for operator configuration               |
| `VERCEL_TOKEN`                  | Optional deployment CLI credential; not required by the app |

Razorpay HMAC secrets and the service-role key need real server runtime bindings, not proxy placeholders. Do not use a proxy-only credential binding for local signature computation. Keep all Razorpay keys, plan IDs and webhook endpoints in the same mode. Use **Test Mode** for preview testing.

## Payments

Configure the webhook endpoint as `https://<preview-host>/api/webhook`. Subscribe to subscription activation, charged, pending, halted, cancellation, completion and expiry-related events exposed by Razorpay. The raw request signature is verified first; the handler then retrieves the current provider subscription to avoid granting access from stale event payloads. Failed delivery returns non-success so Razorpay can retry. Active status alone is insufficient: the paid period end must also be in the future.

The server verifies that the plan is monthly INR ₹99 before creating a subscription. Checkout opening never grants access. Checkout completion validates the payment/subscription HMAC and ownership, then retrieves provider status. Only active subscriptions unlock new Premium operations. Billing-cycle cancellation is supported. UPI AutoPay availability is determined by Razorpay merchant/customer eligibility; it is not guaranteed by this source code. Subscriptions are capped at 120 billing cycles, after which users must subscribe again.

## AI and nutrition

Plans use adult onboarding preferences, equipment, skills, recovery/workout history and optional approximate body-fat results. Gemini runs only on the server. Outputs are schema validated, schedules checked, named excluded ingredients rejected, and unrequested supplements rejected before storing a new plan. Last saved plans survive AI failures.

Energy targets use the Mifflin–St Jeor estimate with moderate activity factors and ±250 kcal goal adjustment, with a 1600 kcal floor. This generalized adult estimate requires individual review; it is not a clinical prescription. Meals use raw ingredient and oil weights. Gemini nutrition/micronutrients and mess presets are **estimates**, not verified food-database measurements. No external food-composition database is connected yet. Avoided-ingredient string checks do not establish allergen safety; check ingredients and labels.

Mess logging gently adjusts remaining meal quantities by at most 25%; exceeding the target does not trigger restriction. Calorie Snap lets users edit detected foods, cooked serving sizes and nutrients before one atomic meal insert. Body scanning requires explicit consent and is skippable. Body images stay private and deletable; consult Google's configured data-retention terms before public launch.

YouTube IDs are embedded only after server-side oEmbed availability and exercise-title checks. Failed/unavailable verification uses external tutorial search links. Playback may still be restricted by the video owner, region or later changes; use the external link. No tutorial embed was verified in this onboarding instance because YouTube requests returned HTTP 403.

## Checks

```sh
npm run typecheck
npm test
npm run build
npm start
# In another terminal, against an instance with no integration variables:
npm run test:browser
# Optional, requires Docker:
npm run test:db
```

The browser suite uses `/usr/bin/chromium` in this cloud machine and checks Android-sized and desktop layouts. Override `playwright.config.ts` for other platforms. The PostgreSQL test creates disposable auth/storage stand-ins to exercise the actual SQL policies; it does not validate Supabase Auth, email or Storage API integrations.

The PWA manifest includes 192/512 PNG icons. The service worker caches only public icons; authenticated health information is never cached. Offline API requests fail visibly and retain the current in-memory view. Full offline editing/synchronization is not implemented.

## Preview and release

1. Push `feature/beingwell`; connect `nujendla/bewell` to a Vercel project with **main** as the production branch. Do not promote this development branch.
2. Configure Preview-only service variables, Supabase redirects and Razorpay Test Mode webhooks.
3. Use the Vercel Git branch Preview, or authenticate the CLI and run `npx vercel` (without `--prod`). Verify the generated Preview URL; do not assume successful deployment from local build results.
4. Complete the release checklist in `RELEASE_CHECKLIST.md`, including independent-user RLS checks against real Supabase and complete Test Mode payment/webhook journeys.
5. Only after critical checks pass, review and merge to the intended production branch. Configure separate Live Mode payment keys/plan/webhook, run approved Live Mode verification, and promote the tested release to `beingwell.vercel.app`.

Current validation and external blockers are in `VALIDATION.md`. Local build success is not evidence of deployment, real authentication, AI results or real payment processing.
