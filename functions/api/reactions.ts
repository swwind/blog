import type { Env } from "@biliblitz/blitz/server";
import { sendNotification } from "../ntfy.ts";

type Reactions = {
  path: string;
  reactions: string;
};

async function getReactions(
  d1: D1Database,
  path: string,
): Promise<Record<string, number>> {
  const reactions = await d1
    .prepare("SELECT * FROM reactions WHERE path = ?")
    .bind(path)
    .first<Reactions>();
  return reactions ? JSON.parse(reactions.reactions) : {};
}

async function saveReactions(
  d1: D1Database,
  path: string,
  reaction: Record<string, number>,
) {
  await d1
    .prepare(
      "INSERT INTO reactions (path, reactions) VALUES (?, ?) ON CONFLICT (path) DO UPDATE SET reactions = excluded.reactions",
    )
    .bind(path, JSON.stringify(reaction))
    .run();
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const search = new URL(ctx.request.url).searchParams;
  const path = search.get("path");

  if (!path) {
    return new Response("path is missing", { status: 400 });
  }

  const reactions = await getReactions(ctx.env.d1, path);
  return Response.json(reactions);
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const search = new URL(ctx.request.url).searchParams;
  const path = search.get("path");

  if (!path) {
    return new Response("path is missing", { status: 400 });
  }

  const formData = (await ctx.request.formData()) as FormData;
  const name = formData.get("name");

  if (typeof name !== "string")
    return new Response("name is missing", { status: 400 });

  const reactions = await getReactions(ctx.env.d1, path);
  const updated = (reactions[name] = (reactions[name] ?? 0) + 1);
  await saveReactions(ctx.env.d1, path, reactions);

  const ip = ctx.request.headers.get("CF-Connecting-IP");

  await sendNotification(
    ctx.env.REACTION_TOPIC,
    `新的 ${name} 按赞 ${path}`,
    `来自 ${ip}`,
    2,
  );

  return Response.json({ updated });
};
