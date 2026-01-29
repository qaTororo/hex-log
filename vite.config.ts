import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    devServer({
      entry: "src/index.ts",
      exclude: [
        /^\/(public|assets|static|src)\/.+/,
        /^\/favicon.ico$/,
        /^\/@.+/,
        /^\/node_modules\/.+/,
      ],
    }),
    tailwindcss(),
  ],
});
