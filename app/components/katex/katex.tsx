import katex from "katex";

// import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
// import { fromHtml } from "hast-util-from-html";
// import { toJsxRuntime } from "hast-util-to-jsx-runtime";

import "katex/dist/katex.min.css";

type Props = {
  mode: "inline" | "display";
  content: string;
};

export function Katex(props: Props) {
  const html = katex.renderToString(props.content, {
    displayMode: props.mode === "display",
    throwOnError: false,
  });

  // const hast = fromHtml(html, { fragment: true });

  // return toJsxRuntime(hast, {
  //   Fragment,
  //   // @ts-ignore
  //   jsx,
  //   // @ts-ignore
  //   jsxs,
  //   elementAttributeNameCase: "html",
  // });

  return <span dangerouslySetInnerHTML={{ __html: html }}></span>;
}
