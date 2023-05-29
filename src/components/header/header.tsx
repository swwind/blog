import { component$ } from "@builder.io/qwik";

import { header } from "~/metadata.json";

export const Header = component$(() => {
  return (
    <header class="mx-6 mb-4 flex shrink-0 justify-between pt-6">
      <span>
        <a href="/" class="font-serif hover:underline">
          {header}
        </a>
      </span>

      <span class="inline-flex gap-4">
        <a href="/about" class="font-serif hover:underline">
          关于
        </a>
        <a href="/friend" class="font-serif hover:underline">
          友链
        </a>
      </span>
    </header>
  );
});
