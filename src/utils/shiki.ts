import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

// Explicit imports keep unused grammars and themes out of the build.
const languages = {
  bash: () => import("shiki/langs/bash.mjs"),
  rust: () => import("shiki/langs/rust.mjs"),
  cpp: () => import("shiki/langs/cpp.mjs"),
  haskell: () => import("shiki/langs/haskell.mjs"),
  ini: () => import("shiki/langs/ini.mjs"),
  toml: () => import("shiki/langs/toml.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  java: () => import("shiki/langs/java.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  mdx: () => import("shiki/langs/mdx.mjs"),
  c: () => import("shiki/langs/c.mjs"),
  php: () => import("shiki/langs/php.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  vue: () => import("shiki/langs/vue.mjs"),
};
const aliases: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  js: "javascript",
  ts: "typescript",
  yml: "yaml",
  md: "markdown",
  conf: "ini",
  curl: "bash",
};

// One shared instance; Shiki deduplicates concurrent grammar loads.
const highlighter = createHighlighterCore({
  themes: [import("shiki/themes/github-dark.mjs")],
  langs: [],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export async function highlight(content: string, language: string) {
  const lang = aliases[language] || language;
  if (!Object.hasOwn(languages, lang)) return "";
  const shiki = await highlighter;
  await shiki.loadLanguage(languages[lang as keyof typeof languages]);
  // The component owns <pre><code>; retain only Shiki’s escaped token markup.
  return shiki
    .codeToHtml(content, { lang, theme: "github-dark" })
    .replace(/^<pre[^>]*><code[^>]*>/, "")
    .replace(/<\/code><\/pre>$/, "");
}
