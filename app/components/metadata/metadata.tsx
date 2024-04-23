import { toYangliCalendar } from "~/utils/chinese-calendar.ts";

interface MetadataProps {
  author: string;
  time: string;
  tags?: string;
  outdate?: boolean;
  updated?: string;
}

export const Metadata = (props: MetadataProps) => {
  const time = new Date(props.time);
  const updated = props.updated ? new Date(props.updated) : time;
  const yearsOld = Math.floor(
    (Date.now() - updated.getTime()) / (365 * 24 * 60 * 60 * 1000),
  );

  return (
    <>
      <div class="info">
        <span>{props.author}</span>
        <time>{toYangliCalendar(time)}</time>
        {props.updated && <time>最后更新于 {toYangliCalendar(updated)}</time>}
        {props.tags?.split(",").map((x, i) => <span key={i}>#{x}</span>)}
      </div>

      {props.outdate !== false && yearsOld > 0 && (
        <>
          <hr />
          <p>
            <b>
              注意：距离本文最后一次更新已经超过 {yearsOld}{" "}
              年，世界线的变动可能会导致故事走向
              <a
                href="https://moegirl.uk/Bad_End"
                referrerpolicy="no-referrer"
                target="_blank"
              >
                不同的结局
              </a>
              。
            </b>
          </p>
          <hr />
        </>
      )}
    </>
  );
};
