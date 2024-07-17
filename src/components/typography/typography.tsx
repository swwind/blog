import { ComponentChildren } from "preact";
import { Nav, NavPortal } from "../nav/nav.tsx";
import { Link } from "@biliblitz/blitz";
import { MDXProvider } from "@mdx-js/preact";

export const Typography = (props: { children?: ComponentChildren }) => {
  return (
    <div class="relative">
      <MDXProvider components={{ a: Link, "set-nav": NavPortal }}>
        <article class="typography">{props.children}</article>
      </MDXProvider>
    </div>
  );
};
