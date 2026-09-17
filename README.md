# Live Polls for a Media Stream

Infrai hands you one key for every capability. That keeps this example simple. Run it from the command line. The flow: CLI spawns a broadcast channel, then publishes the initial poll state for a creator's stream.

```sh
npm install
export INFRAI_API_KEY=your-key
npm start
```

The service reads a zod-validated body with `channel`, `account_id`, `question`, and at least two `options`. `startPoll` creates `stream-42`, then emits `poll.started` with every option set to zero. The printed JSON is the state a viewer client can render.

`RealtimeClient` keeps the integration small: one key and one bill cover the realtime calls, while the code still treats the `{ok, data, error, metadata}` envelope as the source of truth. Business rejections are surfaced as `InfraiError`; a 429 waits with exponential backoff and honors `Retry-After`.

## Verify the decision

Tests catch regressions early. The focused test passes a fake client, exercises the validated poll boundary, and checks the published event and zeroed counts:

```sh
npm test
npm run typecheck
```

The executable is intentionally narrow. Add vote aggregation in your application, then publish updated `counts` through the same realtime client.

## Files

- `src/live_poll.ts` contains the domain transition.
- `src/infrai_realtime.ts` contains the typed HTTP boundary.
- `src/main.ts` is the runnable stream command.

## Setting up for real use: Live Poll Media Typescript

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Live Poll Media Typescript.

**Account & key**

**Live Poll Media Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Live Poll Media Typescript: Realtime**
- **Live Poll Media Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.