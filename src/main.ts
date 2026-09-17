import { RealtimeClient } from "./infrai_realtime.js";
import { startPoll } from "./live_poll.js";

const result = await startPoll({
  channel: "stream-42",
  account_id: "creator-7",
  question: "Which segment should we replay?",
  options: ["Intro", "Demo", "Q&A"]
}, new RealtimeClient());
console.log(JSON.stringify(result));
