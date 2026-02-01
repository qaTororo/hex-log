import { toSSG } from "hono/bun";
import app from "../src/index";
import * as fs from "node:fs/promises";
import * as path from "node:path";

console.log("🚀 Starting Static Site Generation...");

// 1. HTMLを生成 (dist/index.html)
const result = await toSSG(app, {
  dir: "./dist",
});

if (!result.success) {
  console.error("❌ Hono Build failed:", result.error);
  process.exit(1);
}

console.log("📦 Hono HTML generated. Starting post-process...");

try {
  // 2. マニフェストファイルを読み込む
  const manifestPath = path.resolve("./dist/.vite/manifest.json");
  const manifestContent = await fs.readFile(manifestPath, "utf-8");
  const manifest = JSON.parse(manifestContent);

  // 3. 生成されたHTMLファイルを読み込む
  const htmlPath = path.resolve("./dist/index.html");
  let html = await fs.readFile(htmlPath, "utf-8");

  // 4. "src/style.css" のエントリを探して置換パスを決定
  // Manifestのキーは "src/style.css"
  const cssEntry = manifest["src/style.css"];
  if (cssEntry && cssEntry.file) {
    const realCssPath = `/${cssEntry.file}`; // 例: /assets/style-CMoxPwjm.css

    console.log(`🔄 Replacing CSS path: /src/style.css -> ${realCssPath}`);

    // HTML内のリンクを置換 (単純な文字列置換)
    // src/index.ts で href="/src/style.css" と書かれている前提
    html = html.replace('href="/src/style.css"', `href="${realCssPath}"`);

    // 5. 書き換え後のHTMLを保存
    await fs.writeFile(htmlPath, html);
    console.log("✅ Post-process complete! Index.html updated.");
  } else {
    console.warn("⚠️ CSS entry not found in manifest.");
  }
} catch (e) {
  console.error("❌ Post-process failed:", e);
  console.log('Did you run "bun x vite build" first?');
}
