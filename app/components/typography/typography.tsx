import { ComponentChildren } from "preact";
import { Nav, NavPortal, NavProvider } from "../nav/nav.tsx";
import { useState } from "preact/hooks";
import { Link } from "@biliblitz/blitz";
import { MDXProvider } from "@mdx-js/preact";
import { Toc } from "~/utils/toc.ts";

export const Typography = (props: { children?: ComponentChildren }) => {
  const [toc, setToc] = useState<Toc>([]);

  return (
    <div class="relative">
      <div class="absolute right-full top-0 hidden h-full w-64 xl:block">
        <Nav toc={toc} />
      </div>
      <NavProvider value={setToc}>
        <MDXProvider components={{ a: Link, "set-nav": NavPortal }}>
          <article class="typography">{props.children}</article>
        </MDXProvider>
      </NavProvider>
    </div>
  );
};
