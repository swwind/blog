import { ComponentChildren } from "preact";

import shout from "~/assets/audio/senpai.aac";
import poop from "~/assets/images/poop.webp";

export type SenpaiProps = {
  children?: ComponentChildren;
};

export function Senpai(props: SenpaiProps) {
  const shoutOut = () => {
    const audio = new Audio(shout);
    audio.addEventListener("canplay", () => {
      audio.play();
    });
  };

  return (
    <p
      className="cursor-not-allowed"
      onClick={shoutOut}
      style={{
        cursor: `url(${poop}) 12 12, pointer`,
      }}
    >
      {props.children}
    </p>
  );
}
