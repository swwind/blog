import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
import { Turnstile } from "./turnstile.tsx";
import { formatDate } from "~/utils/chinese-calendar.ts";
import { UAParser } from "ua-parser-js";
import {
  Comment,
  sitekey,
  origin,
  generateUserHash,
  weakRandomString,
} from "./utils.ts";
import { ArknightsAvatar } from "./arknights.tsx";

type Props = {
  path: string;
};

function getString(something: {
  name: string | undefined;
  version: string | undefined;
}) {
  if (something.name) {
    if (something.version) return `${something.name}/${something.version}`;
    return something.name;
  }
  return null;
}

function CommentComponent(props: {
  comment: Comment;
  onDelete?: (uuid: string) => void;
}) {
  const { name, content, time, browser, os, hash } = useMemo(() => {
    const parser = new UAParser(props.comment.userAgent.trim());
    return {
      name: props.comment.name.trim() || "匿名用户",
      content: props.comment.content.trim(),
      time: formatDate(props.comment.time),
      browser: getString(parser.getBrowser()),
      os: getString(parser.getOS()),
      hash: generateUserHash(props.comment.pubkey),
    };
  }, [props.comment]);

  const onDelete = props.onDelete;

  return (
    <div class="clear-both mx-6 my-4">
      <span class="float-right select-none">
        <ArknightsAvatar
          id={props.comment.pubkey}
          class="h-20 w-20 object-cover"
        />
      </span>

      <div>
        <b>
          {name}#{hash}
        </b>
        <span class="ml-3 text-sm">{time}</span>
        {browser && <span class="ml-3 text-sm">{browser}</span>}
        {os && <span class="ml-3 text-sm">{os}</span>}
        {onDelete && (
          <span
            class="ml-3 cursor-pointer text-sm underline"
            onClick={() => onDelete(props.comment.id)}
          >
            删除
          </span>
        )}
      </div>

      <div class="m-4">
        {content || (
          <span class="italic">
            他居然钻了空子发了一条空评论！但是事实上他还是什么也做不到。
          </span>
        )}
      </div>
    </div>
  );
}

type CreateCommentProps = {
  path: string;
  // seckey: CryptoKey;
  // pubkey: CryptoKey;
  // identity: string;
  // setComments: StateUpdater<Comment[] | null>;
  // setShow: StateUpdater<boolean>;
  prependComment: (comment: Comment, key: string) => void;
  onSuccess: () => void;
  // onChangeIdentity: () => void;
};

function CreateComment(props: CreateCommentProps) {
  const action = `${origin}/comment`;
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finish, setFinish] = useState(false);

  const [meta, setMeta] = useState({ name: "", pubkey: weakRandomString() });
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
    <p>
      <form
        method="POST"
        action={action}
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget, event.submitter);
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
                key: string;
              };
              props.prependComment(data.comment, data.key);
              if (textarea.current) {
                textarea.current.value = "";
              }
            } finally {
              setSubmitting(false);
              props.onSuccess();
            }
          })();
        }}
      >
        <input type="hidden" name="path" value={props.path} />
        <input type="hidden" name="pubkey" value={meta.pubkey} />
        <div class="grid grid-cols-3 gap-2">
          <input
            type="text"
            name="name"
            class="col-span-3"
            placeholder="尊姓大名"
            value={meta.name}
            onInput={(e) =>
              setMeta((meta) => ({ ...meta, name: e.currentTarget.value }))
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
            <div class="flex items-center justify-between">
              <div
                onClick={() =>
                  setMeta((meta) => ({ ...meta, pubkey: weakRandomString() }))
                }
              >
                <ArknightsAvatar
                  id={meta.pubkey}
                  class="h-20 w-20 object-cover"
                />
              </div>
              <Turnstile sitekey={sitekey} onSuccess={() => setFinish(true)} />
            </div>
          </div>
          <button
            disabled={submitting || !finish}
            class="col-span-3 border-2 border-slate-800 disabled:pointer-events-none disabled:opacity-60 dark:border-slate-100"
          >
            {finish
              ? submitting
                ? "提交中..."
                : "提交评论"
              : "等待验证通过..."}
          </button>
        </div>
      </form>
    </p>
  );
}

interface Storage {
  keys: [string, string][];
}

const storageKey = "sww.moe:keys";

function loadStorage(): Storage {
  const keys = localStorage.getItem(storageKey);
  return keys ? JSON.parse(keys) : { keys: [] };
}

function addStorage(uuid: string, key: string) {
  const storage = loadStorage();
  const keys = new Map(storage.keys);
  keys.set(uuid, key);
  storage.keys = [...keys];
  localStorage.setItem(storageKey, JSON.stringify(storage));
}

function removeStorage(uuid: string) {
  const storage = loadStorage();
  const keys = new Map(storage.keys);
  keys.delete(uuid);
  storage.keys = [...keys];
  localStorage.setItem(storageKey, JSON.stringify(storage));
}

export function Comments(props: Props) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [show, setShow] = useState(false);
  const [storage, setStorage] = useState<Map<string, string>>(new Map());

  const refreshStorage = () => {
    setStorage(new Map(loadStorage().keys));
  };

  useEffect(refreshStorage, []);

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

  const [invisible, setInvisible] = useState<string[]>([]);
  const visibleComments = useMemo(
    () => comments && comments.filter(({ id }) => !invisible.includes(id)),
    [comments, invisible],
  );

  return (
    <>
      <p>
        <button
          class="col-span-3 border-2 border-slate-800 px-8 dark:border-slate-100"
          onClick={() => setShow((show) => !show)}
        >
          {show ? "关闭" : "添加评论"}
        </button>
      </p>

      {show && (
        <CreateComment
          path={props.path}
          prependComment={(comment, key) => {
            setComments((comments) => [comment, ...(comments || [])]);
            addStorage(comment.id, key);
            refreshStorage();
          }}
          onSuccess={() => setShow(false)}
        />
      )}

      {visibleComments === null ? (
        <p class="italic opacity-60">少女祈祷中...</p>
      ) : visibleComments.length === 0 ? (
        <p class="italic opacity-60">暂时没有评论</p>
      ) : (
        visibleComments.map((comment) =>
          storage.has(comment.id) ? (
            <CommentComponent
              key={comment.id}
              comment={comment}
              onDelete={async () => {
                const formData = new FormData();
                formData.append("path", props.path);
                formData.append("uuid", comment.id);
                formData.append("key", storage.get(comment.id)!);
                const response = await fetch(`${origin}/delete`, {
                  method: "POST",
                  body: formData,
                });
                const json = (await response.json()) as { ok: true };
                if (json.ok) {
                  setInvisible((invisible) => [...invisible, comment.id]);
                  removeStorage(comment.id);
                  refreshStorage();
                }
              }}
            />
          ) : (
            <CommentComponent key={comment.id} comment={comment} />
          ),
        )
      )}
    </>
  );
}
