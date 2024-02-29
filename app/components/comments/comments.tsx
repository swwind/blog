import { useEffect, useRef, useState } from "preact/hooks";
import manifest from "../../metadata.json";
import { Turnstile } from "./turnstile.tsx";
import md5 from "blueimp-md5";
import { formatDate } from "~/utils/chinese-calendar.ts";
import { UAParser } from "ua-parser-js";

type Props = {
  path: string;
};

type Comment = {
  id: string;
  name: string;
  site: string;
  avatar: string;
  content: string;
  time: number;
  userAgent: string;
};

const origin = manifest["comment-api-origin"];

const github = (id: string) => `https://github.com/${id}.png`;
const qq = (id: string) => `https://q1.qlogo.cn/g?b=qq&nk=${id}&s=100`;
const gravatar = (hash: string) =>
  `https://gravatar.com/avatar/${hash}.jpg?s=100`;

function getAvatarURL(avatar: string) {
  if (!avatar) return null;
  if (avatar.startsWith("gh:")) return github(avatar.slice(3));
  if (avatar.startsWith("qq:")) return qq(avatar.slice(3));
  return gravatar(
    avatar.length === 32 && /^[a-z0-9]$/.test(avatar) ? avatar : md5(avatar),
  );
}

function getString(something: {
  name: string | undefined;
  version: string | undefined;
}) {
  if (something.name) {
    if (something.version) return `${something.name} ${something.version}`;
    return something.name;
  }
  return null;
}

function Comment(props: { comment: Comment }) {
  const name = props.comment.name.trim() || "匿名用户";
  const site = props.comment.site.trim();
  const avatarURL = getAvatarURL(props.comment.avatar.trim());
  const content = props.comment.content.trim();
  const time = formatDate(props.comment.time);
  const parser = new UAParser(props.comment.userAgent.trim());
  const browser = getString(parser.getBrowser());
  const os = getString(parser.getOS());

  return (
    <p>
      {site ? (
        <a href={site} target="_blank" rel="noreferrer">
          <b>{name}</b>
        </a>
      ) : (
        <b>{name}</b>
      )}
      <span class="ml-3 text-sm">{time}</span>
      {browser && <span class="ml-3 text-sm">{browser}</span>}
      {os && <span class="ml-3 text-sm">{os}</span>}
      <br />
      {content || (
        <span class="italic">
          他居然钻了空子发了一条空评论！但是事实上他还是什么也做不到。
        </span>
      )}
    </p>
  );
}

export function Comments(props: Props) {
  const sitekey = import.meta.env.DEV
    ? "1x00000000000000000000AA"
    : manifest["cf-sitekey"];
  const action = `${origin}/comment`;

  const [comments, setComments] = useState<Comment[] | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    const url = `${origin}/comments?path=${props.path}`;
    fetch(url, { signal: abort.signal })
      .then((resp) => resp.json())
      .then((data: { count: number; path: string; comments: Comment[] }) => {
        const comments = data.comments;
        comments.sort((a, b) => b.time - a.time);
        setComments(comments);
      });

    return () => {
      abort.abort();
    };
  }, []);

  const [meta, setMeta] = useState({ name: "", site: "", mail: "" });
  // load
  useEffect(() => {
    const cache = localStorage.getItem("comments-metadata");
    if (cache) setMeta(JSON.parse(cache));
  }, []);
  // save
  useEffect(() => {
    localStorage.setItem("comments-metadata", JSON.stringify(meta));
  }, [meta]);

  return (
    <>
      <p>
        <button
          class="col-span-3 border-2 px-8"
          onClick={() => setShow((show) => !show)}
        >
          {show ? "关闭" : "添加评论"}
        </button>
      </p>

      {show && (
        <p>
          <form
            method="POST"
            action={action}
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(
                event.currentTarget,
                event.submitter,
              );
              setSubmitting(true);

              (async () => {
                try {
                  const response = await fetch(action, {
                    method: "POST",
                    body: formData,
                  });
                  if (response.status !== 200) {
                    const message = await response.text();
                    alert(`Error: ${message}`);
                    return;
                  }
                  const data = (await response.json()) as {
                    ok: true;
                    comment: Comment;
                  };
                  setComments((comments) => [
                    data.comment,
                    ...(comments || []),
                  ]);
                  if (textarea.current) {
                    textarea.current.value = "";
                  }
                } finally {
                  setSubmitting(false);
                  setShow(false);
                }
              })();
            }}
          >
            <input type="hidden" name="path" value={props.path} />
            <div class="grid grid-cols-3 gap-2">
              <input
                type="text"
                name="name"
                placeholder="匿名用户"
                value={meta.name}
                onInput={(e) =>
                  setMeta((meta) => ({ ...meta, name: e.currentTarget.value }))
                }
              />
              <input
                type="text"
                name="site"
                placeholder="https://..."
                value={meta.site}
                onInput={(e) =>
                  setMeta((meta) => ({ ...meta, site: e.currentTarget.value }))
                }
              />
              <input
                type="text"
                name="avatar"
                placeholder="<email> / gh:<id> / qq:<id>"
                value={meta.mail}
                onInput={(e) =>
                  setMeta((meta) => ({ ...meta, mail: e.currentTarget.value }))
                }
              />
              <textarea
                name="content"
                class="col-span-3 h-24 min-h-24"
                ref={textarea}
                required
                placeholder="不支持 Markdown"
              />
              <div class="col-span-3">
                <Turnstile sitekey={sitekey} />
              </div>
              <button disabled={submitting} class="col-span-3 border-2">
                {submitting ? "提交中..." : "提交评论"}
              </button>
            </div>
          </form>
        </p>
      )}

      {comments === null ? (
        <p class="italic opacity-60">少女祈祷中...</p>
      ) : comments.length === 0 ? (
        <p class="italic opacity-60">暂时没有评论</p>
      ) : (
        comments.map((comment) => (
          <Comment comment={comment} key={comment.id} />
        ))
      )}
    </>
  );
}
