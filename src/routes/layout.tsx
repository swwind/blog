import { Outlet } from "@biliblitz/blitz";
import { meta$ } from "@biliblitz/blitz/server";
import { Christmas } from "~/components/easter-egg/chirstmas.tsx";
import { Footer } from "~/components/footer/footer.tsx";
import { Header } from "~/components/header/header.tsx";
import { Typography } from "~/components/typography/typography.tsx";
import metadata from "../metadata.json";
import { useEffect } from "preact/hooks";

export const meta = meta$((_ctx, meta) => {
  meta.title = meta.title
    ? `${meta.title} - ${metadata["site-name"]}`
    : metadata["site-name"];
});

const accessDenied = atob(
  "PGgxPllvdXIgYWNjZXNzIHRvIHRoaXMgc2l0ZSBpcyBwcm9oaWJpdGVkIGR1ZSB0byBhIHN1c3BpY2lvdXMgYmVoYXZpb3VyLjwvaDE+",
);
const senpaiURL = atob(
  "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj0tUmhBbGhtTnptOA==",
);

export default () => {
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const hasWebGL =
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
      if (!hasWebGL) throw new Error("bad browser");
    } catch {
      setTimeout(() => {
        location.href = senpaiURL;
      }, 5000);
      document.write(accessDenied);
    }
  }, []);

  return (
    <div class="mx-auto flex min-h-screen max-w-4xl flex-col transition-[translate] duration-1000 xl:translate-x-24">
      <Header />
      <main class="flex-1">
        <Typography>
          <Outlet />
        </Typography>
      </main>
      <Footer />
      <Christmas />
    </div>
  );
};
