import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import { header } from "~/metadata.json";

export const Header = component$(() => {
  return (
    <header class="mx-6 pt-6 flex justify-between shrink-0">
      <span>
        <Link href="/" class="hover:underline font-serif">
          {header}
        </Link>
      </span>

      <span class="inline-flex gap-4">
        <Link href="/about" class="hover:underline font-serif">
          关于
        </Link>
        <Link href="/friend" class="hover:underline font-serif">
          友链
        </Link>
      </span>
    </header>
  );
});
