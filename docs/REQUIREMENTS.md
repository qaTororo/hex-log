# 要件定義書

## 1. プロジェクト概要

- **プロジェクト名:** edge-case
- **概要:** QAエンジニアによる越境開発プロジェクト。技術ブログの設計・実装・テスト・運用を一気通貫で行い、QA × 開発の掛け算でスキルマップを拡張する。
- **目的:**
  1. **越境実践:** QAエンジニアが自ら設計→実装→テスト→運用する一気通貫プロセスの実践。AI時代にQA領域だけで閉じず、開発との掛け算でスキルマップを拡張する
  2. **プレゼンス:** プロジェクト・ブログ記事・OSS公開を通じて、QA業界での存在感を高める
  3. **ナレッジ蓄積:** TFTの思考プロセスと技術学習の記録を継続的に残す
  4. **実験場:** Hono/Bunなど新技術を評価するサンドボックス
- **スコープ宣言:**
  - 個人開発だが、Shift Leftの実践としてテスト戦略・品質設計を要件定義段階から組み込む
  - チーム開発プラクティス（ADR、テストピラミッド、CI/CD、品質ゲート）を意図的に適用する

## 2. ターゲット

### ブログの読者

- **プライマリ:** QA業界の同業者・コミュニティ
  - JaSST・connpass等のQA系イベント参加者
  - 「他社のQAはどうやっているか」を知りたい人
  - 見るもの: テスト戦略、品質への取り組み、QA×開発の越境事例
- **セカンダリ:** 越境志向の技術者
  - 専門領域を広げたいエンジニア
  - 見るもの: 技術記事、アーキテクチャ設計、実装の過程
- **ターシャリ:** 未来の自分
  - 見るもの: 学習ログ、ADR、TFT記録
- **対象外:** 一般のTFTプレイヤー

### コンテンツカテゴリ

| カテゴリ | 内容 | 比重 |
|---------|------|------|
| Tech | 技術記事（フレームワーク、ツール、実装記録） | メイン |
| QA | QA視点の記事（テスト設計、品質戦略、越境開発記） | サブ |
| TFT | TFTの思考プロセス記録 | 息抜き |

## 3. 技術スタック

### 採用技術

| 技術 | バージョン | 採用理由 | トレードオフ |
|------|-----------|---------|-------------|
| Hono | ^4.11.7 | Web標準API準拠（fetch, Request, Response）。マルチランタイム対応によるエッジ実行と移植性 | Next.js/Remix比でエコシステムが小さい。SSG/SSR統合は自前実装が必要 |
| Bun | runtime | バンドラ・テストランナー・パッケージマネージャを内蔵するオールインワンランタイム。起動速度・インストール速度に優位性 | Node.jsと100%互換ではない。本番運用実績がNode.jsより少ない |
| Vite | ^7.3.1 | HMRの高速性。@hono/vite-dev-serverによるHono統合が成熟 | Bun単体でもバンドル可能だが、Viteのプラグインエコシステム（Tailwind統合等）を優先 |
| Tailwind CSS | v4 | CSS-firstの設計に刷新。`@import "tailwindcss"` のゼロコンフィグ。ユーティリティファーストによる一貫したスタイリング | CSS-in-JSやCSS Modulesとの比較は → ADR-0003 |
| TypeScript | ^5 | `strict: true` + `noUncheckedIndexedAccess` で最大限の型安全性を確保 | — |

### 選定の判断軸

本プロジェクトの技術選定は、以下の原則に従う。業務プロジェクトとは異なり、個人の学習・実験を主目的としているため、効率よりも理解の深さを優先する。

1. **学習価値の最大化:** 業務で経験済みの技術（Node.js、Next.js、ESLint等）より、未経験の技術を優先する。プロダクション採用の前に手を動かして評価する場とする
2. **抽象化よりも理解:** フレームワークが隠蔽する仕組み（SSG、ルーティング等）を自分で実装することで、汎用的な知識を獲得する。便利さよりも学びの深さを取る
3. **Web標準準拠:** プラットフォーム固有APIへの依存を避ける。学んだ知識の移植性を確保する
4. **DX:** 高速なフィードバックループ（HMR、テスト実行速度）を維持する。学習目的であっても、開発体験の悪化は継続のモチベーションを損なう
5. **テスタビリティ:** テストしやすい設計を促す技術選択か（QAエンジニアとしての本業の視点）

> 各技術の比較検討過程 → ADR-0001〜0003

## 4. アーキテクチャ設計

### 4.1 レンダリング戦略

| ページ種別 | 戦略 | 理由 |
|-----------|------|------|
| 記事詳細 | SSG | コンテンツはビルド時に確定。CDNキャッシュでTTFBを最小化 |
| 記事一覧 | SSG | 新記事追加時にビルドすれば十分。リアルタイム性不要 |
| OGP画像 | ビルド時生成 | 記事メタデータから自動生成 |
| 検索（将来） | クライアントサイド or SSR | 記事数が少ないうちはクライアントサイド検索で十分 |

> レンダリング戦略の比較検討 → ADR-0004

### 4.2 フロントエンド戦略

未確定。インタラクティブ要件（TFTビジュアライザ等）の技術要件が具体化した段階でADR-0007として決定する。

候補:
- Hono JSX のみ
- Hono + React（Islands Architecture）
- Hono + HonoX

### 4.3 ディレクトリ構成

```
src/
  index.ts              # Honoアプリ エントリポイント
  routes/               # ルート定義
  components/           # UIコンポーネント（JSX）
  lib/                  # ユーティリティ・ヘルパー
    markdown.ts         # Markdownパース・変換パイプライン
    ogp.ts              # OGP生成
  content/
    posts/              # 記事本体（YYYY-MM-DD-slug.md）
  styles/               # CSSファイル
  types/                # 型定義
tests/
  unit/                 # ユニットテスト
  integration/          # 統合テスト
  e2e/                  # E2Eテスト
  visual/               # VRT
  fixtures/             # テストデータ
docs/
  REQUIREMENTS.md       # 要件定義書（本文書）
  adr/                  # Architecture Decision Records
  api/                  # API仕様
  architecture/         # アーキテクチャ図
  design/               # デザインガイドライン
  visual/               # ビジュアルモック
```

### 4.4 Markdownパイプライン

```
記事ファイル (.md)
  → frontmatter解析（gray-matter）
    → メタデータ抽出（title, date, tags, category, description）
  → Markdown → HTML変換（unified + remark + rehype）
    → シンタックスハイライト（rehype-prism等）
    → サニタイズ（rehype-sanitize）
    → 目次生成
  → OGPメタタグ生成
  → 静的HTML出力
```

素のMarkdownを採用する。MDXは採用しない（コンテンツのポータビリティを優先）。

## 5. 機能要件

### Must（MVP）

| 機能 | 詳細 | 完了条件 |
|------|------|---------|
| Markdown記事管理 | frontmatter付きMarkdownファイルをGitで管理。CMS不使用 | 記事の追加・編集がmdファイルの追加・編集だけで完結する |
| 記事一覧ページ | 日付降順。タイトル、日付、カテゴリ、概要を表示 | SSGで静的HTML生成。ビルド成果物にindex.htmlが存在する |
| 記事詳細ページ | Markdown→HTMLレンダリング。シンタックスハイライト | コードブロックがハイライトされている。目次が自動生成される |
| コンテンツカテゴリ | Tech / QA / TFT の3カテゴリ | frontmatterのcategoryフィールドで各カテゴリの記事一覧が絞り込める |
| OGPメタタグ | title, description, og:image をページごとに設定 | SNSやSlackでURLを共有した際にリッチプレビューが表示される |
| レスポンシブデザイン | モバイルファーストのTailwind CSSによるレイアウト | 320px・768px・1280pxの各ブレークポイントでレイアウトが正常に表示される |
| テスト基盤 | ユニットテスト + 統合テストの実行環境 | `bun test` でグリーン |
| CI/CD基盤 | GitHub Actionsで lint→test→build を自動実行 | mainブランチへのPRで自動実行される |

### Should（第2フェーズ）

| 機能 | 判断基準 |
|------|---------|
| タグ・フィルタリング | 記事が10本を超えた時点 |
| RSS/Atom配信 | SEO強化フェーズで追加 |
| ダークモード切替 | デザイン確定後 |
| OGP画像自動生成 | 手動画像作成が負担になった時点 |

### Could（実験的機能）

| 機能 | 判断基準 |
|------|---------|
| TFT盤面ビジュアライザ | TFT記事の表現力が不足した時点。→ ADR-0007のトリガー |
| 全文検索（FlexSearch等） | 記事が30本を超えた時点 |
| i18n（英語記事） | 海外コミュニティへの発信を検討する時点 |
| コメント機能（giscus） | 読者からのフィードバックが欲しくなった時点 |

> Should/Could機能は感覚ではなく判断基準で追加タイミングを制御する。

## 6. 非機能要件

### 6.1 パフォーマンス

| 指標 | 目標値 | 計測方法 |
|------|--------|---------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse CI |
| INP (Interaction to Next Paint) | < 200ms | Lighthouse CI |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse CI |
| Lighthouse Performance Score | >= 90 | CI内で自動計測 |

SSGベースの静的サイトであるため、CDN配信を前提にJavaScriptバンドルサイズを最小限に保つことで達成する。

### 6.2 SEO

- robots.txt / sitemap.xml の自動生成
- 構造化データ（JSON-LD）: Article スキーマ
- canonical URL の設定
- meta description の全ページ設定

### 6.3 アクセシビリティ

- **目標レベル:** WCAG 2.1 Level A
- セマンティックHTML（article, nav, header, main, footer）
- 画像への alt 属性
- キーボードナビゲーション対応
- カラーコントラスト比 4.5:1 以上

### 6.4 セキュリティ

- Content Security Policy (CSP) ヘッダの設定
- XSS対策: Markdownパース時のサニタイズ（rehype-sanitize）
- 依存パッケージの脆弱性チェック（CI内で実行）

## 7. テスト戦略

このプロジェクトの最重要セクション。QAエンジニアとしての知見を開発に持ち込む。

### 7.1 テストピラミッド

```
        /  E2E  \           ← 少数・高コスト・高信頼
       /   VRT   \
      / 統合テスト  \
     / ユニットテスト \      ← 多数・低コスト・高速
    ------------------
```

| レイヤー | 対象 | ツール | 実行タイミング |
|---------|------|--------|-------------|
| **ユニット** | Markdownパーサ、frontmatter解析、ユーティリティ関数、OGP生成ロジック | bun:test | 毎コミット（pre-commit + CI） |
| **統合** | Honoルートの正常応答・エラー応答、Markdownパイプライン全体（入力.md → 出力HTML） | bun:test + app.request() | CI（PRごと） |
| **E2E** | ページ遷移、リンクの正常動作、OGPメタタグの存在確認 | Playwright | CI（mainマージ前） |
| **VRT** | 記事一覧・詳細ページのスクリーンショット比較 | Playwright + pixelmatch | CI（mainマージ前） |

### 7.2 テスタビリティ設計

テストしやすいコードを書くための設計原則:

- **純粋関数の分離:** 副作用のないロジック（Markdownパース、メタデータ抽出、日付フォーマット等）は純粋関数として実装し、単体テストを容易にする
- **依存の注入:** 外部依存（ファイルシステム、HTTP等）はインターフェース経由で注入し、テストダブルに差し替え可能にする
- **テストダブルの方針:** モック/スタブはテスト対象の境界でのみ使用。内部実装のモックは避ける
- **テストが書きにくい設計を事前に潰す:** 密結合、グローバル状態、隠れた副作用を設計段階で排除する

### 7.3 品質メトリクス

| メトリクス | 目標 |
|-----------|------|
| カバレッジ（lib/配下） | 80%以上 |
| テスト実行時間（Unit + 統合） | 30秒以内 |
| フレイキーテスト | 0件（発見次第即修正） |

### 7.4 テスト設計

- **テストの3つの意図:**
  1. **回帰検知:** 既存機能の破壊を検出する
  2. **仕様の文書化:** テストケースが仕様書の代わりになる
  3. **設計の検証:** テストが書きにくいなら設計を見直すシグナル
- **命名規則:** `describe("対象") → test("条件 → 期待結果")`
- **fixtures管理:** tests/fixtures/ にサンプルMarkdownファイル等を配置

### 7.5 実行戦略

- E2EとVRTは実行時間が長いため、毎コミットではなくPR/mainマージ時のみ実行
- ユニット/統合テストの高速フィードバックを優先する

## 8. CI/CDパイプライン

### パイプライン

```
[Push/PR] → lint → type-check → test:unit → test:integration → build → test:e2e → test:vrt → deploy(mainのみ)
```

### 品質ゲート

| ステップ | 保証する品質 | ツール | 失敗時 |
|---------|------------|--------|--------|
| lint | コードスタイルの一貫性、静的解析 | Biome | 即失敗 |
| type-check | 型安全性 | tsc --noEmit | 即失敗 |
| test:unit | ロジックの正当性 | bun test tests/unit/ | 即失敗 |
| test:integration | ルート・パイプラインの結合動作 | bun test tests/integration/ | 即失敗 |
| build | ビルド成功、SSG生成 | vite build | 即失敗 |
| test:e2e | ユーザー操作の正常動作 | Playwright | 失敗+レポート生成 |
| test:vrt | 視覚的デグレードの検出 | Playwright + pixelmatch | 失敗+diff画像保存 |
| deploy | 本番反映 | デプロイ先CLIツール | ロールバック可能 |

### 設計方針

- **高速フェイル:** コストの低いチェック（lint→型チェック）を先に実行し、早期に失敗させる
- **並列化:** lint + type-check は並列実行可能
- **キャッシュ:** Bunインストールキャッシュ、Playwrightブラウザバイナリのキャッシュ

> リンターの選定過程 → ADR-0006

## 9. デプロイ戦略

### 採用: Cloudflare Pages

- Honoとの高い親和性（Hono自体がCloudflare Workers環境で生まれたフレームワーク）
- Web標準API（fetch, Request, Response）に準拠し、Honoの設計思想と一致
- 無料枠: 月500回ビルド、帯域無制限
- エッジ実行: Cloudflare Workers（世界300+ PoP）

> Vercel / Deno Deploy との比較検討 → ADR-0005

## 10. ドキュメント構成

### docs/ 配下の役割

| ディレクトリ | 役割 | ファイル命名規則 |
|------------|------|----------------|
| `docs/adr/` | Architecture Decision Records | `NNNN-title.md`（例: `0001-framework-selection.md`） |
| `docs/api/` | API仕様書 | ルート単位 |
| `docs/architecture/` | アーキテクチャ図・設計書 | 自由 |
| `docs/design/` | デザインガイドライン | 自由 |
| `docs/visual/` | ビジュアルモック・スクリーンショット | 自由 |

### ADRテンプレート

```markdown
# ADR-NNNN: タイトル

## ステータス

提案 / 承認 / 廃止 / 代替（ADR-XXXX）

## コンテキスト

なぜこの判断が必要になったか

## 検討した選択肢

1. 選択肢A — メリット / デメリット
2. 選択肢B — メリット / デメリット

## 決定

選択肢Xを採用する

## 結果

この決定によって生じる影響
```

### 初期ADR候補

| ADR | テーマ |
|-----|--------|
| ADR-0001 | フレームワーク選定（Hono vs Next.js vs Remix） |
| ADR-0002 | ランタイム選定（Bun vs Node.js vs Deno） |
| ADR-0003 | CSSフレームワーク選定（Tailwind CSS v4 vs CSS Modules vs CSS-in-JS） |
| ADR-0004 | レンダリング戦略（SSG+SSR ハイブリッド vs フルSSG vs フルSSR） |
| ADR-0005 | デプロイ先選定（Cloudflare Pages vs Vercel vs Deno Deploy） |
| ADR-0006 | リンター選定（Biome vs ESLint+Prettier） |
| ADR-0007 | フロントエンド戦略（Hono JSX vs React vs HonoX）— 未決定 |
