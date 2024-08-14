import type { Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

type Options = {
  map?: Record<string, string>;
};

/**
 * Replace all element with map
 */
export const rehypeReplaceElement: Plugin<[Options?], Root, Root> = (
  options = {},
) => {
  const map = options.map || {};

  return (root) => {
    visit(root, "element", (node) => {
      if (node.tagName in map) {
        node.tagName = map[node.tagName];
      }
    });
  };
};
