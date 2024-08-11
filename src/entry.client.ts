import { createClientApp } from "@biliblitz/blitz";
import { manifest } from "blitz:manifest/client";

import Root from "./Root.vue";

const { app } = createClientApp(Root, { manifest });

app.mount("#app", true);
