import { serveStatic } from "@biliblitz/node-server";
import { serve } from "@hono/node-server";

const fetch = serveStatic({ root: "./dist/static/" });

serve({ fetch }, (info) => {
  console.log(`Listening on http://localhost:${info.port}/`);
});
