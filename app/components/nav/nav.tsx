import { Link } from "@biliblitz/blitz";
import { ComponentChildren, createContext } from "preact";
import { Dispatch, StateUpdater, useContext, useEffect } from "preact/hooks";
import { Toc } from "~/utils/toc.ts";

type Setter<T> = Dispatch<StateUpdater<T>>;
const NavContext = createContext<Setter<Toc>>(() => {});

export function NavProvider(props: {
  value: Setter<Toc>;
  children?: ComponentChildren;
}) {
  return (
    <NavContext.Provider value={props.value}>
      {props.children}
    </NavContext.Provider>
  );
}

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
  const setter = useContext(NavContext)!;

  useEffect(() => {
    const toc = JSON.parse(props.toc) as Toc;
    console.log(toc);
    setter(toc);
  }, [props.toc]);

  return null;
}
