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

export default () => {
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("bad browser");
    } catch {
      location.href = "https://www.youtube.com/watch?v=-RhAlhmNzm8";
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
