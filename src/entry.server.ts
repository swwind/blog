import { createServer } from "@biliblitz/blitz/server";
import { manifest } from "blitz:manifest/server";
import Root from "./Root.vue";

export default createServer(Root, { manifest });
