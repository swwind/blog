import { Outlet } from "@biliblitz/blitz";
import { meta$ } from "@biliblitz/blitz/server";
import { Christmas } from "~/components/easter-egg/chirstmas.tsx";
import { Footer } from "~/components/footer/footer.tsx";
import { Header } from "~/components/header/header.tsx";
import { Typography } from "~/components/typography/typography.tsx";
import metadata from "../metadata.json";

export const meta = meta$((_ctx, meta) => {
  meta.title = meta.title
    ? `${meta.title} - ${metadata["site-name"]}`
    : metadata["site-name"];
});

export default () => {
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
