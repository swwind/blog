const server = "https://ntfy.sww.moe/";

export async function sendNotification(
  topic: string,
  title: string,
  message: string,
  priority = 3,
) {
  // skip DEV
  if (!topic) return;

  await fetch(server, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, title, message, priority }),
  });
}
