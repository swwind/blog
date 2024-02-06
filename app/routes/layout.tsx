import { Outlet } from "@biliblitz/blitz";
import { Christmas } from "~/components/easter-egg/chirstmas.tsx";
import { Footer } from "~/components/footer/footer.tsx";
import { Header } from "~/components/header/header.tsx";
import { Typography } from "~/components/typography/typography.tsx";

export default () => {
  return (
    <div class="mx-auto flex min-h-screen max-w-3xl flex-col">
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
