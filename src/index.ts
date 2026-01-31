import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/src/style.css">
        <title>Edge Case</title>
      </head>
      <body class="bg-gray-900 text-white p-4">
        <h1 class="text-4xl font-bold text-blue-400">Hello Edge Case!</h1>
        <p class="mt-2">Tailwind v4 is working.</p>
      </body>
    </html>
  `);
});

export default app;
