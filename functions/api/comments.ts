import type { Env } from "@biliblitz/blitz/server";

type Comment = {
  id: string;
  path: string;
  name: string;
  time: number;
  hash: string | null;
  pubkey: string;
  content: string;
  userAgent: string;
};

async function getCommentsByPath(d1: D1Database, path: string) {
  return (
    await d1
      .prepare("SELECT * FROM comments WHERE path = ? ORDER BY time DESC")
      .bind(path)
      .all<Comment>()
  ).results;
}

async function getCommentByIdAndPath(d1: D1Database, id: string, path: string) {
  return await d1
    .prepare("SELECT * FROM comments WHERE id = ? AND path = ?")
    .bind(id, path)
    .first<Comment>();
}

async function createComment(d1: D1Database, comment: Comment) {
  await d1
    .prepare(
      "INSERT INTO comments (id, path, name, time, hash, pubkey, content, userAgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      comment.id,
      comment.path,
      comment.name,
      comment.time,
      comment.hash,
      comment.pubkey,
      comment.content,
      comment.userAgent,
    )
    .run();
}

async function deleteComment(d1: D1Database, id: string) {
  await d1.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
}

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function turnstileVerify(
  token: string,
  ip: string | null,
  seckey: string,
): Promise<boolean> {
  const formData = new FormData();
  formData.set("secret", seckey);
  formData.set("response", token);
  if (ip) formData.set("remoteip", ip);

  const resp = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body: formData,
  });
  const json = (await resp.json()) as { success: boolean };

  return json.success === true;
}

function toHex(array: Uint8Array) {
  return [...array].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function sha512(data: string) {
  const buffer = new TextEncoder().encode(data);
  const arrayBuffer = await crypto.subtle.digest("SHA-512", buffer);
  return toHex(new Uint8Array(arrayBuffer));
}

async function randomKey() {
  const buffer = crypto.getRandomValues(new Uint8Array(24));
  const key = toHex(buffer);
  const hash = await sha512(key);
  return { key, hash };
}

async function verifyKey(key: string, hash: string | null) {
  return hash && (await sha512(key)) === hash;
}

const server = "https://ntfy.sww.moe/";

async function sendNotification(
  topic: string,
  title: string,
  message: string,
  priority = 3,
) {
  // skip DEV
  if (!topic) return;

  await fetch(server, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, title, message, priority }),
  });
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const search = new URL(ctx.request.url).searchParams;

  const path = search.get("path");
  if (!path) {
    return new Response("path is missing", { status: 400 });
  }

  const comments = await getCommentsByPath(ctx.env.d1, path);
  return Response.json({ count: comments.length, path, comments });
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const search = new URL(ctx.request.url).searchParams;

  const path = search.get("path");
  if (!path) {
    return new Response("path is missing", { status: 400 });
  }

  const action = search.get("_action");
  if (!action) {
    return new Response("_action is missing", { status: 400 });
  }

  switch (action) {
    // create comment
    case "create": {
      const formData = (await ctx.request.formData()) as FormData;
      const token = formData.get("cf-turnstile-response");

      if (typeof token !== "string") {
        return new Response("cannot find cf-turnstile-response", {
          status: 400,
        });
      }

      if (
        !(await turnstileVerify(
          token,
          ctx.request.headers.get("CF-Connecting-IP"),
          ctx.env.SECRET_KEY,
        ))
      ) {
        return new Response(
          "Robots are not allowed to be here! But AL-1S is kawaii!",
          { status: 403 },
        );
      }

      const name = formData.get("name");
      const pubkey = formData.get("pubkey");
      const content = formData.get("content");

      if (typeof name !== "string")
        return new Response("name is missing", { status: 400 });
      if (typeof pubkey !== "string")
        return new Response("pubkey is missing", { status: 400 });
      if (typeof content !== "string")
        return new Response("content is missing", { status: 400 });

      const id = crypto.randomUUID();
      const keypair = await randomKey();
      const comment: Comment = {
        id,
        path,
        name,
        time: Date.now(),
        hash: keypair.hash,
        pubkey,
        content,
        userAgent: ctx.request.headers.get("User-Agent") || "unknown",
      };

      await createComment(ctx.env.d1, comment);

      await sendNotification(
        ctx.env.NTFY_TOPIC,
        `新的博客评论 ${path}`,
        `${name}: ${content}`,
      );

      return Response.json({ ok: true, comment, key: keypair.key });
    }

    // remove comment
    case "remove": {
      const formData = await ctx.request.formData();

      const uuid = formData.get("uuid");
      const key = formData.get("key");

      if (typeof uuid !== "string")
        return new Response("uuid is missing", { status: 400 });
      if (typeof key !== "string")
        return new Response("key is missing", { status: 400 });

      const comment = await getCommentByIdAndPath(ctx.env.d1, uuid, path);
      if (!comment) {
        return new Response("comment not exist", { status: 404 });
      }

      if (!(await verifyKey(key, comment.hash))) {
        return new Response(
          "Permission denied, you are not the owner of this comment",
          { status: 403 },
        );
      }

      await deleteComment(ctx.env.d1, comment.id);

      await sendNotification(
        ctx.env.NTFY_TOPIC,
        `评论被删除 ${path}`,
        `${comment.name}: ${comment.content}`,
      );

      return Response.json({ ok: true });
    }
  }

  return new Response("Bad action", { status: 400 });
};
