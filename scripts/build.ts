// scripts/build.ts
import { toSSG } from "hono/bun";
import app from "../src/index";

console.log("🚀 Starting Static Site Generation...");

// manifest.json の読み込み
const manifestPath = "./dist/.vite/manifest.json";
const manifestFile = Bun.file(manifestPath);

if (!(await manifestFile.exists())) {
  console.error(`❌ ${manifestPath} が見つかりません。先に vite build を実行してください。`);
  process.exit(1);
}

const manifest = await manifestFile.json();
const cssEntry = manifest["src/style.css"];

if (!cssEntry?.file) {
  console.error('❌ manifest.json に "src/style.css" エントリが見つかりません。');
  process.exit(1);
}

const cssPath = `/${cssEntry.file}`; // 例: "/assets/style-CMoxPwjm.css"

// appに定義されたルート（"/"など）を巡回して、distフォルダにHTMLを吐き出す
const result = await toSSG(app, {
  dir: "./dist",
});

if (!result.success) {
  console.error("❌ Build failed:", result.error);
  process.exit(1);
}

console.log(`✅ SSG complete! Generated ${result.files.length} files.`);

// HTML後処理: /src/style.css を manifest のパスに置換
const glob = new Bun.Glob("**/*.html");
let replacedCount = 0;

for await (const path of glob.scan("./dist")) {
  const filePath = `./dist/${path}`;
  const html = await Bun.file(filePath).text();

  if (html.includes("/src/style.css")) {
    const updated = html.replaceAll("/src/style.css", cssPath);
    await Bun.write(filePath, updated);
    replacedCount++;
    console.log(`  📝 ${path}: CSS参照を置換しました`);
  }
}

console.log(`✅ Build complete! ${replacedCount} files updated with hashed CSS path.`);
