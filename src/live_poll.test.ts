import assert from "node:assert/strict";
import { startPoll } from "./live_poll.js";

const calls: Array<{ path: string; body?: unknown }> = [];
const fake = {
  createChannel: async (body: unknown) => { calls.push({ path: "/v1/realtime/channel/create", body }); return {}; },
  publish: async (body: unknown) => { calls.push({ path: "/v1/realtime/publish", body }); return {}; }
} as any;
const result = await startPoll({ channel: "room", account_id: "acct", question: "Pick", options: ["A", "B"] }, fake);
assert.deepEqual(result.counts, { A: 0, B: 0 });
assert.equal(calls[1].path, "/v1/realtime/publish");
assert.equal((calls[1].body as any).event, "poll.started");
console.log("live poll decision: starts with zeroed option counts");
