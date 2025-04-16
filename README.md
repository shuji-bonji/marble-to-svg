# Marble to SVG

このプロジェクトは、RxJSのTestSchedulerで使用されるマーブル記法をSVG図に変換するツールです。  
[`RxJS` の `TestScheduler`](https://rxjs.dev/guide/testing/marble-testing) で利用されている、`Marble diagrams` から、`SVG`を生成します。

これにより、Observableのタイムラインを視覚的に表現できます。

## 主な機能

1. マーブル記法の文字列を解析（parseMarble関数）
2. マーブルイベントをSVGに変換（renderSVG関数）
3. ブラウザでの対話的なUI（MarbleViewer）
4. 多様なマーブル図のサンプル例
5. SVGのダウンロード機能

## プロジェクトのセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/marble-svg-generator.git
cd marble-svg-generator

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test

# GitHub Pagesにデプロイ
npm run deploy
```

## 使い方

### ブラウザでの使用

1. `npm run dev`でローカルサーバーを起動すると、ブラウザでUIが表示されます
2. マーブル記法を入力フィールドに入力（例：`---a---b---|`）
3. 必要に応じて値のマッピングをJSON形式で指定（例：`{ "a": "Hello", "b": "World" }`）
4. 「SVG生成」ボタンをクリックしてSVGを生成
5. 「SVGをダウンロード」ボタンでSVGファイルをダウンロード

### プログラムでの使用

```ts
// モジュールから関数をインポート
import { parseMarble, renderSVG } from './src/main';

// マーブル記法と値マッピングを指定
const marble = '---a---b---|';
const values = { a: 'Hello', b: 'World' };

// マーブル文字列を解析してイベントを取得
const events = parseMarble(marble, { values });

// SVGとして描画
const svg = renderSVG(events, {
  width: 800,
  height: 60,
  markers: {
    radius: 15,
    fill: '#fff'
  }
});

// SVGをHTMLに挿入（ブラウザ実行時）
document.getElementById('svg-container')!.innerHTML = svg;
```

## 主要なAPI

### parseMarble

```ts
parseMarble<T = any>(
  marbleString: string,
  options?: {
    values?: Record<string, T>;
    error?: any;
    includeSubscription?: boolean;
  }
): MarbleEvent<T>[]
```

マーブル記法の文字列をパースして`MarbleEvent[]`に変換します。

### renderSVG

```ts
renderSVG<T = any>(
  events: MarbleEvent<T>[],
  options?: Partial<RenderOptions>
): string
```

`MarbleEvent[]`をSVG文字列に変換します。オプションでSVGの見た目をカスタマイズできます。

### MarbleViewer

```ts
new MarbleViewer(containerId: string, renderOptions?: Partial<RenderOptions>)
```

指定された要素IDにマーブルビューワーUIを作成します。

## マーブル記法の構文

| 記号 | 意味 | 例 |
|------|------|------|
| `-` | 時間の経過（1フレーム） | `--a--`（20ms後にaを発行） |
| `\|` | 完了通知 | `--a--\|`（aを発行後、完了） |
| `#` | エラー通知 | `--a--#`（aを発行後、エラー） |
| `()` | 同時発行するグループ | `--(abc)--`（a,b,cを同時に発行） |
| `^` | 購読開始（Hot Observable） | `-a-^-b--`（購読後にbのみ受信） |
| `!` | 購読解除 | `-a-^-b--!--`（bの後で購読解除） |

## 拡張と今後の計画

このプロジェクトは、以下のような拡張がを考えています。

1. **VitePress Plugin**: マークダウン内でマーブル記法を直接SVGに変換
2. **VSCode Markdown拡張**: VSCode内でのマーブル記法のプレビュー
3. **GitHub Actions連携**: READMEやドキュメント内のマーブル記法を自動的にSVGに変換
4. **TestScheduler連携**: RxJSテストのマーブル結果を自動的に可視化

## ライセンス

MITライセンスで公開しています。自由に利用、改変、再配布できます。