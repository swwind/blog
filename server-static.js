import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

app.use(serveStatic({ root: "./dist/static/" }));

serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}/`);
});
