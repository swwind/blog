import { component$, Slot } from "@builder.io/qwik";
import { Footer } from "~/components/footer/footer";
import { Header } from "~/components/header/header";
import { Typography } from "~/components/typography/typography";

export default component$(() => {
  return (
    <div class="max-w-3xl mx-auto flex flex-col min-h-screen">
      <Header />
      <main class="flex-1">
        <Typography>
          <Slot />
        </Typography>
      </main>
      <Footer />
    </div>
  );
});
