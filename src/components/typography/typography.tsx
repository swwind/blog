import { component$, Slot, useStyles$ } from "@builder.io/qwik";

import style from "./typography.css?inline";

export const Typography = component$(() => {
  useStyles$(style);

  return (
    <article class="typography">
      <Slot />
    </article>
  );
});
