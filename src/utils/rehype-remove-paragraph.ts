import type { Root } from "hast";
import type { Plugin } from "unified";

/**
 * make
 *
 * ```html
 * <p><vue-metadata></vue-metadata></p>
 * ```
 *
 * into
 *
 * ```html
 * <vue-metadata></vue-metadata>
 * ```
 */
export const rehypeRemoveParagraph: Plugin<[], Root, Root> = () => {
  return (root) => {
    root.children = root.children.flatMap((x) => {
      if (
        x.type === "element" &&
        x.tagName === "p" &&
        x.children.length === 1 &&
        x.children[0].type === "element" &&
        x.children[0].tagName.startsWith("vue-")
      ) {
        return x.children;
      } else {
        return [x];
      }
    });
  };
};
