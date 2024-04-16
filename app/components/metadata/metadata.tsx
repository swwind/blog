import { toYangliCalendar } from "~/utils/chinese-calendar.ts";

interface MetadataProps {
  author: string;
  time: string;
  tags?: string;
  outdate?: boolean;
}

export const Metadata = (props: MetadataProps) => {
  const time = new Date(props.time);
  const yearsOld = Math.floor(
    (Date.now() - time.getTime()) / (365 * 24 * 60 * 60 * 1000),
  );

  return (
    <>
      <div class="info">
        <span>{props.author}</span>
        <time>{toYangliCalendar(time)}</time>
        {props.tags?.split(",").map((x, i) => <span key={i}>#{x}</span>)}
      </div>

      {props.outdate !== false && yearsOld > 0 && (
        <>
          <hr />
          <p>
            <b>
              注意：这篇文章已经发布超过 {yearsOld}{" "}
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
