import {
  toChineseCalendar,
  toYangliCalendar,
} from "~/utils/chinese-calendar.ts";

interface MetadataProps {
  author: string;
  time: string;
  tags?: string;
}

export const Metadata = (props: MetadataProps) => {
  const time = new Date(props.time);

  return (
    <div class="info">
      <span>{props.author}</span>
      <time title={toYangliCalendar(time)}>{toChineseCalendar(time)}</time>
      {props.tags?.split(",").map((x, i) => <span key={i}>#{x}</span>)}
    </div>
  );
};
