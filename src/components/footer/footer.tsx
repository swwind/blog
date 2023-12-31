import { component$ } from "@builder.io/qwik";

export const Footer = component$(() => {
  return (
    <footer class="mx-6 flex shrink-0 justify-end py-6">
      <p class="text-right font-serif text-xs opacity-60">
        <span>Copyright © 2017-2024 swwind. All rights reserved</span>
        <br />
        <span>
          Except where otherwise noted, content on this blog is licensed under
          CC-BY 2.0
        </span>
      </p>
    </footer>
  );
});
