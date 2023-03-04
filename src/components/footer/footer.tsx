import { component$ } from "@builder.io/qwik";

export const Footer = component$(() => {
  return (
    <footer class="mx-6 py-6 flex justify-end shrink-0">
      <p class="text-xs opacity-60 text-right font-serif">
        <span>Copyright © 2017-2023 swwind. All rights reserved</span>
        <br />
        <span>
          Except where otherwise noted, content on this blog is licensed under
          CC-BY 2.0
        </span>
      </p>
    </footer>
  );
});
