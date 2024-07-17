import { hydrate } from "@biliblitz/blitz";
import { manifest } from "blitz:manifest/client";
import Root from "./root.tsx";

hydrate(<Root />, { manifest });
