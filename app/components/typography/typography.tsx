import { ComponentChildren } from "preact";

export const Typography = (props: { children?: ComponentChildren }) => {
  return <article class="typography">{props.children}</article>;
};
