<h1 align="center">
  <img src="./public/logo.svg" width="80" alt="Logo" /><br/>
  Blog
</h1>

<div align="center">
  <p>
    <a href="README.md">简体中文</a> | <a href="README.en.md">English</a> | <b>日本語</b>
  </p>
</div>

<div align="center">
  <h3 align="center">A Modern, Minimalist Digital Garden</h3>
  <p align="center">
    生活の温もりを感じ、コードでデジタルの庭を構築しよう。
  </p>
  
  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-DB-3ECF8E?style=flat&logo=supabase" alt="Supabase" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat&logo=typescript" alt="TypeScript" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat" alt="License: MIT" /></a>
    <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs Welcome" /></a>
  </p>
</div>

---

## 📖 プロジェクト紹介 (Introduction)

これは **Next.js 16 (App Router)** と **Supabase** で構築された、モダンな個人ブログシステムです。

単なるコンテンツ管理システム（CMS）にとどまらず、読書体験と視覚的な美しさにこだわったデジタル空間です。ミニマリズムのデザインスタイルと、スムーズなインタラクションアニメーション、強力な執筆ツールを融合させ、クリエイターには純粋な表現プラットフォームを、読者には快適な閲覧環境を提供することを目指しています。

## ✨ 主な機能 (Features)

### 🎨 究極の視覚体験
- **モダンなデザイン**: shadcn/ui を採用し、Glassmorphism（すりガラス効果）を組み合わせた、透明感のあるクリーンなUI。
- **レスポンシブな操作性**: モバイルおよびデスクトップデバイスに完全対応、エレガントなスライドメニューやスワイプ操作をサポート。
- **ダークモード**: システムに連動する完璧なダークモード、目に優しく洗練されたデザイン。
- **タイポグラフィの美学**: **Noto Serif SC**（源ノ明朝）を統合し、見出しやテキストに印刷物のような質感を提供。
- **滑らかなアニメーション**: Framer Motionに基づく、ページ遷移、スプラッシュ画面、マイクロインタラクション。

### ✍️ 強力な執筆システム
- **デュアルモードエディタ**: Tiptapを基盤とし、**WYSIWYG**（見たままの編集）と **Markdownソース** の双方向の切り替えをサポート。
- **スマートアシスタント**: 画像貼り付けの自動アップロード、ドラッグ＆ドロップによる並べ替え、目次の自動生成が可能。
- **コンテンツの収益化**: クリエイターのプロフィール設定に、投げ銭QRコード（WeChat/Alipay対応）のフローを実装。

### 🛡️ 堅牢な技術アーキテクチャ
- **フルスタックの型安全性**: TypeScript + Supabaseの自動生成型により、フロントエンド・バックエンドのデータ安全性を確保。
- **エンタープライズ級の認証**: パスワードリセット、アバターのアップロード（自動圧縮とクリーンアップ）、プロフィール管理をサポートする完全な認証フロー。
- **高パフォーマンス**: Next.js React Server Components (RSC) と Skeletonローディング戦略により、高速なレスポンスを実現。
- **SEO フレンンドリー**: Sitemap、Robots 構成、および JSON-LD 構造化データを自動生成し、検索エンジンでのインデックスを最適化。

## 🛠️ 技術スタック (Tech Stack)

- **フレームワーク**: [Next.js 16](https://nextjs.org/) (App Router)
- **言語**: TypeScript
- **スタイリング**: [Tailwind CSS 4](https://tailwindcss.com/)
- **コンポーネント**: [shadcn/ui](https://ui.shadcn.com/)
- **アニメーション**: [Framer Motion](https://www.framer.com/motion/)
- **データベース / 認証**: [Supabase](https://supabase.com/) (PostgreSQL)
- **エディター**: [Tiptap](https://tiptap.dev/)

## 🚀 クイックスタート (Quick Start)

必要環境：Node.js >= 22.0.0。

### 1. プロジェクトのクローン

```bash
git clone https://github.com/ZiYan416/Blog
cd blog
```

### 2. 依存関係のインストール

パッケージ管理には `npm` を推奨します：

```bash
npm install
```

### 3. 環境変数の設定

`.env.local.example` を `.env.local` にコピーし、Supabase の構成情報を入力します：

```bash
cp .env.local.example .env.local
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

これで、`http://localhost:3000` にアクセスしてプロジェクトをプレビューできます。

## 🧭 プロジェクト構成 (Architecture)

ルートとリクエスト境界は `src/app`、ドメインコードは `src/features`、共有レイアウト/UI は `src/components`、サーバーとデータベースの境界は `src/server` と `src/db` に配置します。コードを追加・移動する前に [プロジェクト構成とモジュール境界](docs/architecture.md) を参照してください。

## 🤝 貢献について (Contributing)

どのような形での貢献も大歓迎です！Issueの報告、新機能の追加、ドキュメントの改善など、すべての作業がプロジェクトを良くすることに繋がります。

貢献する前に、[貢献ガイド](CONTRIBUTING.md) と [アーキテクチャ規約](docs/architecture.md) を確認してください。バグ報告や提案には対応するテンプレートを使用してください：

- [バグ報告 (Bug Report)](.github/ISSUE_TEMPLATE/bug_report.md)
- [機能リクエスト (Feature Request)](.github/ISSUE_TEMPLATE/feature_request.md)

## 📄 ライセンス (License)

本プロジェクトは [MIT License](LICENSE) の下でオープンソース化されています。商業・非商業を問わず、学習、変更、使用することが自由に許可されています。
