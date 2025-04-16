import { MarbleViewer } from './components/MarbleViewer';
import { DEFAULT_RENDER_OPTIONS } from './utils/constants';
import { parseMarble } from './parser/parseMarble';
import { renderSVG } from './renderer/renderSVG';

// グローバルにエクスポート（外部からの利用をサポート）
(window as any).MarbleTools = {
  parseMarble,
  renderSVG,
  MarbleViewer,
};

// ドキュメントロード時にビューワーを初期化
document.addEventListener('DOMContentLoaded', () => {
  // ビューワーを初期化
  const viewer = new MarbleViewer(
    'marble-viewer-container',
    DEFAULT_RENDER_OPTIONS
  );

  // サンプル例
  const exampleSelector = document.getElementById(
    'example-selector'
  ) as HTMLSelectElement;
  // const loadExampleButton = document.getElementById(
  //   'load-example'
  // ) as HTMLButtonElement;

  // サンプル例データ
  const examples = {
    basic: {
      marble: '---a---b---|',
      values: { a: 'Hello', b: 'World' },
    },
    error: {
      marble: '---a---b---#',
      values: { a: 1, b: 2 },
    },
    group: {
      marble: '---(abc)---|',
      values: { a: 1, b: 2, c: 3 },
    },
    hot: {
      marble: '-a-^-b---c---|',
      values: { a: 'ignored', b: 'Hello', c: 'World' },
    },
    unsubscribe: {
      marble: '-a-^-b---c---!---|',
      values: { a: 'ignored', b: 'Hello', c: 'World' },
    },
    complex: {
      marble: '---(abc)---(def)---|',
      values: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 },
    },
  };

  // loadExampleButton.addEventListener('click', () => {
  exampleSelector.addEventListener('change', () => {
    const selectedExample = exampleSelector.value;
    if (selectedExample in examples) {
      const example = examples[selectedExample as keyof typeof examples];
      viewer.setValues(example.marble, example.values);
      viewer.render();
    }
  });

  // デフォルト例を設定
  viewer.setValues(examples.basic.marble, examples.basic.values);
  viewer.render();
});

// エクスポート（モジュールからの利用をサポート）
export { parseMarble, renderSVG, MarbleViewer };
