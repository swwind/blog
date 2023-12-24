import { component$, Slot } from "@builder.io/qwik";
import { Christmas } from "~/components/easter-egg/chirstmas";
import { Footer } from "~/components/footer/footer";
import { Header } from "~/components/header/header";
import { Typography } from "~/components/typography/typography";

export default component$(() => {
  return (
    <div class="mx-auto flex min-h-screen max-w-3xl flex-col">
      <Header />
      <main class="flex-1">
        <Typography>
          <Slot />
        </Typography>
      </main>
      <Footer />
      <Christmas />
    </div>
  );
});
