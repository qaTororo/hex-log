import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";

export default defineConfig({
  plugins: [
    devServer({
      entry: "src/index.ts", // サーバーのコードがどこにあるか
      exclude: [/^\/(public|assets|static)\/.+/, /^\/favicon.ico$/], // 静的ファイルを除外
    }),
  ],
});
