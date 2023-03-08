import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import { header } from "~/metadata.json";

export const Header = component$(() => {
  return (
    <header class="mx-6 mb-4 flex shrink-0 justify-between pt-6">
      <span>
        <Link href="/" class="font-serif hover:underline">
          {header}
        </Link>
      </span>

      <span class="inline-flex gap-4">
        <Link href="/about" class="font-serif hover:underline">
          关于
        </Link>
        <Link href="/friend" class="font-serif hover:underline">
          友链
        </Link>
      </span>
    </header>
  );
});
