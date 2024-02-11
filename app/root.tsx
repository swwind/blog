import { BlitzCityProvider, RouterHead, RouterOutlet } from "@biliblitz/blitz";

import "./global.css";
import "./prism-tomorrow.css";

import { MDXProvider } from "@mdx-js/preact";
import { Katex } from "./components/katex/katex.tsx";

export default function () {
  return (
    <BlitzCityProvider lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/momoi.png" />
        <RouterHead />
      </head>
      <body>
        <MDXProvider components={{ katex: Katex }}>
          <RouterOutlet />
        </MDXProvider>
      </body>
    </BlitzCityProvider>
  );
}