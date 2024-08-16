import type { Env } from "@biliblitz/blitz/server";

declare module "@biliblitz/blitz/server" {
  interface Env {
    d1: D1Database;
    NTFY_TOPIC: string;
    SECRET_KEY: string;
  }
}
