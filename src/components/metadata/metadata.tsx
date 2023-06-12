import { component$ } from "@builder.io/qwik";
import { toChineseCalendar, toYangliCalendar } from "~/utils/chinese-calendar";

interface MetadataProps {
  author: string;
  time: string;
  tags?: string;
}

export const Metadata = component$<MetadataProps>((props) => {
  const time = new Date(props.time);

  return (
    <div class="info">
      <span>{props.author}</span>
      <time title={toYangliCalendar(time)}>{toChineseCalendar(time)}</time>
      {props.tags?.split(",").map((x, i) => (
        <span key={i}>#{x}</span>
      ))}
    </div>
  );
});
