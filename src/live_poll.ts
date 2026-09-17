import { z } from "zod";
import { RealtimeClient } from "./infrai_realtime.js";

export const pollBody = z.object({
  channel: z.string().min(1),
  account_id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2)
});
export type PollInput = z.infer<typeof pollBody>;

export async function startPoll(input: PollInput, client: RealtimeClient) {
  const poll = pollBody.parse(input);
  await client.createChannel({ channel: poll.channel, type: "public", vendor: "pusher" });
  const counts = Object.fromEntries(poll.options.map((option) => [option, 0]));
  await client.publish({ channel: poll.channel, event: "poll.started", account_id: poll.account_id, data: { question: poll.question, options: poll.options, counts } });
  return { channel: poll.channel, question: poll.question, counts };
}
