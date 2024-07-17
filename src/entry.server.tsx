import { createServer } from "@biliblitz/blitz/server";
import { manifest } from "blitz:manifest/server";
import Root from "./root.tsx";

export default createServer(<Root />, { manifest });
