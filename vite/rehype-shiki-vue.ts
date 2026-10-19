import type { Root } from "hast";
import type { Plugin } from "unified";
import { visit, SKIP } from "unist-util-visit";

/** Keep code as text in build output; tokenize only after client mounting. */
const rehypeShiki: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (element) => {
    if (element.tagName !== "pre" || element.children.length !== 1) return;
    const code = element.children[0];
    if (code.type !== "element" || code.tagName !== "code") return;
    const classes = code.properties.className;
    if (Array.isArray(classes) && classes.includes("language-math")) return;
    const language = Array.isArray(classes)
      ? classes.find((name) => String(name).startsWith("language-"))
      : undefined;
    element.tagName = "vue-shiki";
    element.properties = {
      ...element.properties,
      content: code.children
        .map((node) => (node.type === "text" ? node.value : ""))
        .join(""),
      language: language ? String(language).slice(9) : "text",
    };
    element.children = [];
    return SKIP;
  });
};

export default rehypeShiki;
