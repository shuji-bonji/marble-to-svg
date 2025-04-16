# マーブル記法 → SVGジェネレーター プロジェクト構造

```
marble-svg-generator/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.ts              # エントリーポイント
│   ├── types.ts             # 型定義
│   ├── parser/
│   │   └── parseMarble.ts   # マーブル記法のパーサー
│   ├── renderer/
│   │   └── renderSVG.ts     # SVG生成関数
│   ├── components/
│   │   └── MarbleViewer.ts  # UI表示用コンポーネント
│   └── utils/
│       └── constants.ts     # 定数
├── tests/
│   ├── parser.test.ts       # パーサーのテスト
│   └── renderer.test.ts     # レンダラーのテスト
└── public/
    └── style.css            # スタイルシート
```

## 主要ファイルの役割

### src/`types.ts`
マーブルイベントや設定などの型定義を行います。

### src/parser/`parseMarble.ts`
マーブル記法の文字列を解析して、内部表現（MarbleEvent[]）に変換します。

### src/renderer/`renderSVG.ts`
MarbleEvent[]をSVG文字列に変換します。時間軸、通知（next、complete、error）などを視覚的に表現します。

### src/components/`MarbleViewer.ts`
ユーザー入力を受け取り、パーサーとレンダラーを使用してSVGを生成・表示するUIコンポーネントです。

### `index.html`
デモページのHTMLファイルです。マーブル記法の入力フィールドとSVGプレビュー領域を含みます。

## デプロイと拡張

1. Viteでビルドし、GitHub Pagesにデプロイ
2. 将来的な拡張：
   - VitePress Pluginとしての実装
   - VSCode Markdown拡張（markdown-itを使用）
   - GitHub ActionsでのSVG自動生成