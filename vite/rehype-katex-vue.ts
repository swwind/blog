import { visit } from "unist-util-visit";
import { toText } from "hast-util-to-text";

/**
 * Plugin to transform `<span class=math-inline>` and `<div class=math-display>`
 * into `<vue-katex mode="inline" content="xxx" />` and `<vue-katex mode="display" content="xxx" />`
 */
const rehypeKatex = function () {
  return (tree: any, _file: any) => {
    visit(tree, "element", (element) => {
      const classes =
        element.properties && Array.isArray(element.properties.className)
          ? element.properties.className
          : [];
      const inline = classes.includes("math-inline");
      const display = classes.includes("math-display");

      if (!inline && !display) {
        return;
      }

      const value = toText(element, { whitespace: "pre" });

      if (inline) {
        element.children = [
          {
            type: "element",
            tagName: "vue-katex",
            properties: {
              mode: "inline",
              content: value,
            },
            children: [],
          },
        ];
      }

      if (display) {
        element.children = [
          {
            type: "element",
            tagName: "vue-katex",
            properties: {
              mode: "display",
              content: value,
            },
            children: [],
          },
        ];
      }
    });
  };
};
export default rehypeKatex;
