import { BlitzCityProvider, RouterHead, RouterOutlet } from "@biliblitz/blitz";

import "./global.css";

export default function () {
  return (
    <BlitzCityProvider lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/momoi.webp" />
        <RouterHead />
      </head>
      <body>
        <RouterOutlet />
      </body>
    </BlitzCityProvider>
  );
}
