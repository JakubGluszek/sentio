// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { QueueSession } from "./QueueSession";

export interface SessionQueue {
  id: string;
  name: string;
  sessions: Array<QueueSession>;
  session_idx: number;
  session_cycle: number;
  iterations: number;
}