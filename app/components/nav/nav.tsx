import { Link } from "@biliblitz/blitz";
import { Toc } from "~/utils/toc.ts";

function NavToc(props: { toc: Toc }) {
  return (
    <ol>
      {props.toc.map((item, index) => (
        <li key={index}>
          <Link href={item.hash}>{item.label}</Link>
          {item.children.length > 0 && <NavToc toc={item.children} />}
        </li>
      ))}
    </ol>
  );
}

type NavProps = {
  toc: Toc;
};

export function Nav(props: NavProps) {
  return (
    <nav class="toc">
      <NavToc toc={props.toc} />
    </nav>
  );
}

export function NavPortal(props: { toc: string }) {
  return <Nav toc={JSON.parse(props.toc)}></Nav>;
}
