# ADR-0005: デプロイ先選定

## ステータス

承認

## コンテキスト

edge-caseのデプロイ先を選定する必要がある。前提条件は以下の通り。

- HonoをWebフレームワークとして採用済み（→ ADR-0001）
- MVP段階ではSSGによる静的サイト。将来的にSSRを追加する可能性がある（→ ADR-0004）
- 個人プロジェクトのため、無料枠の範囲で運用したい
- カスタムドメインの設定が可能であること
- CI/CD（GitHub Actions）との統合が容易であること

## 検討した選択肢

### 1. Vercel

Next.jsの開発元が運営するホスティングプラットフォーム。フロントエンドプロジェクトのデプロイに特化。

- **メリット:**
  - GitHub連携によるゼロコンフィグデプロイ。プッシュするだけで自動デプロイ
  - プレビュー環境が自動生成（PRごとにプレビューURLが発行される）
  - Edge Functions対応。Honoの動作実績あり
  - Web Analytics（無料枠あり）が組み込み
  - DXが最も優れている（ダッシュボード、ログ、デプロイ履歴）
- **デメリット:**
  - Next.jsに最適化されており、Hono単体での運用はエコシステムの恩恵を受けにくい
  - 無料枠: 月100GB帯域、Serverless Function実行時間制限あり
  - 商用利用には有料プラン（$20/月〜）が必要
  - 市場で最も広く使われており、個人プロジェクトとしての差別化・学習価値が低い

### 2. Deno Deploy

Denoランタイムに特化したエッジホスティング。Deno社が運営。

- **メリット:**
  - エッジ実行（世界35+リージョン）
  - Deno KV（キーバリューストア）が組み込み
  - GitHubリポジトリから直接デプロイ可能
  - HonoはDenoをファーストクラスでサポート
- **デメリット:**
  - ランタイムとしてBunを採用済み（→ ADR-0002）のため、デプロイ環境だけDenoになる不整合
  - Bun固有のAPI（`bun:test`等）はDeno Deploy上で動作しない（ビルド成果物のみデプロイなら問題ないが）
  - 静的サイトホスティングとしてはCloudflare Pages/Vercelに比べて機能が限定的
  - 日本リージョンの有無が不明確

### 3. Netlify

静的サイトホスティングの先駆者。Netlify Functions（AWS Lambda相当）を内蔵。

- **メリット:**
  - 静的サイトのデプロイが最もシンプル。`dist/` フォルダを指定するだけ
  - プレビューデプロイ（PRごと）
  - フォーム処理、Identity（認証）等の組み込みサービス
  - 無料枠: 月100GB帯域、月300分ビルド
- **デメリット:**
  - Edge Functions（Deno Runtime）でHonoは動作するが、Cloudflare Workersほどのファーストクラスサポートではない
  - SSRへの移行時にNetlify Functionsの制約を受ける可能性がある
  - 近年はVercel/Cloudflareに押されて勢いが減速している印象

### 4. Cloudflare Pages

Cloudflareのエッジプラットフォーム。静的サイトホスティング + Cloudflare Workers（エッジ関数）。

- **メリット:**
  - **Honoとの親和性が最も高い:** Hono自体がCloudflare Workers環境で誕生したフレームワーク。作者のyusukebeさんがCloudflareのDeveloper Advocate
  - **Web標準APIの整合性:** Cloudflare WorkersはWeb標準（fetch, Request, Response）に準拠しており、Honoの設計思想と完全に一致する
  - **無料枠が寛大:** 月500回ビルド、帯域無制限、1日10万リクエスト（Workers）
  - **エッジ実行:** 世界300+ PoPでのエッジ実行。日本にも複数の拠点
  - **段階的拡張:** 静的サイト → Workers（SSR）→ KV/R2/D1（ストレージ）への段階的な拡張パスがある
  - **学習価値:** Cloudflareのエッジコンピューティングエコシステム（Workers, KV, R2, D1, Queues等）を学べる
  - **wrangler CLI:** デプロイ、プレビュー、ローカル開発がCLIで完結
- **デメリット:**
  - Vercelほどのゼロコンフィグ体験ではない。wrangler.tomlの設定が必要
  - プレビューデプロイはあるが、Vercelほど洗練されていない
  - Workers環境はNode.js互換ではない（Web標準API + Cloudflare独自API）。一部のNode.jsライブラリが動作しない可能性
  - ダッシュボードのUXがVercelに比べてやや劣る

### 比較軸

| 観点 | Vercel | Deno Deploy | Netlify | Cloudflare Pages |
|------|--------|-------------|---------|-----------------|
| Hono親和性 | ○ | ○ | △ | ◎（出身地） |
| SSG対応 | ◎ | ○ | ◎ | ◎ |
| SSR拡張性 | ◎ | ◎ | ○ | ◎（Workers） |
| 無料枠 | ○（100GB/月） | ○（100K req/日） | ○（100GB/月） | ◎（帯域無制限） |
| エッジ実行 | ○ | ◎ | ○ | ◎（300+ PoP） |
| DX | ◎ | ○ | ○ | ○ |
| 学習価値 | △（広く使われ済み） | ○ | △ | ◎（エコシステムが広い） |
| ランタイム整合性 | ○ | △（Bun採用済み） | ○ | ○ |

## 決定

**Cloudflare Pagesを採用する。**

## 結果

- Honoの出身地であるCloudflare環境でデプロイすることで、フレームワークとプラットフォームの整合性が最大化される
- MVP段階では静的サイトをCloudflare Pagesにデプロイ。wrangler CLIでGitHub Actions統合
- 将来のSSR移行時にはCloudflare Workers Functionsを追加するだけで対応可能
- 帯域無制限の無料枠により、個人ブログとしてのコスト管理が容易
- Cloudflareエコシステム（Workers, KV, R2等）の学習がブログ記事のネタにもなる
- wrangler.tomlの設定とGitHub Actionsワークフローの構築が必要（→ CI/CDパイプライン設計に影響）
