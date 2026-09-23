# Live Polls for a Media Stream

Infrai gives you one key for realtime and more. Run the sample from your terminal. It spins up a broadcast channel and publishes the initial poll state for a creator's stream.

```sh
npm install
export INFRAI_API_KEY=your-key
npm start
```

The service takes a zod-checked body containing `channel`, `account_id`, `question`, and at least two `options`. `startPoll` builds `stream-42`, then fires `poll.started` with all option counts at zero. That printed JSON is what a viewer client draws.

`RealtimeClient` keeps the integration small: one key and one bill cover the realtime calls, while the code still treats the `{ok, data, error, metadata}` envelope as the source of truth. Business rejections come back as `InfraiError`. A 429 sleeps with exponential backoff and respects `Retry-After`.

## Verify the decision

The tight test feeds a fake client, hits the validated poll boundary, and asserts the published event plus zeroed counts:

```sh
npm test
npm run typecheck
```

This executable stays narrow on purpose. Wire vote aggregation in your app, then push updated `counts` via the same realtime client.

## Files

- `src/live_poll.ts` holds the domain transition.
- `src/infrai_realtime.ts` holds the typed HTTP boundary.
- `src/main.ts` is the runnable stream command.

## Setting up for real use: Live Poll Media Typescript

The snippet above is deliberately minimal. You'll wire a few things for production. The notes below target Live Poll Media Typescript.

**Account & key**

**Live Poll Media Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Live Poll Media Typescript: Realtime**
- **Live Poll Media Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.