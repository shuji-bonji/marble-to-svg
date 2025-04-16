import { describe, it, expect } from 'vitest';
import { renderSVG } from '../src/renderer/renderSVG';
import { parseMarble } from '../src/parser/parseMarble';
import { DeepPartial, RenderOptions } from '../src/types';

describe('renderSVG', () => {
  it('基本的なSVGを生成できる', () => {
    const events = parseMarble('---a---b---|');
    const svg = renderSVG(events);

    // SVGタグが含まれていることを確認
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');

    // タイムラインが描画されていることを確認
    expect(svg).toContain('<line');

    // 円マーカーが含まれていることを確認（next イベント）
    expect(svg).toContain('<circle');

    // 完了マーカーが含まれていることを確認
    expect(svg).toContain('<path');

    // 値のテキストが含まれていることを確認
    expect(svg).toContain('<text');
    expect(svg).toContain('a</text>');
    expect(svg).toContain('b</text>');
  });

  it('カスタムレンダリングオプションを適用できる', () => {
    const events = parseMarble('---a---|');
    const customOptions: DeepPartial<RenderOptions> = {
      width: 400,
      height: 80,
      markers: {
        radius: 20,
        fill: '#ff0000',
      },
    };

    const svg = renderSVG(events, customOptions);

    // カスタムサイズが適用されていることを確認
    expect(svg).toContain('width="400"');
    expect(svg).toContain('height="80"');

    // カスタム色が適用されていることを確認
    expect(svg).toContain('fill="#ff0000"');

    // カスタム半径が適用されていることを確認
    expect(svg).toContain('r="20"');
  });

  it('エラーイベントを描画できる', () => {
    const events = parseMarble('---#');
    const svg = renderSVG(events);

    // エラーマーカーのパスが含まれていることを確認
    expect(svg).toContain('<path');
    // エラーマーカーの色が適用されていることを確認
    expect(svg).toContain('stroke="#d44"');
  });

  it('サブスクリプションイベントを描画できる', () => {
    const events = parseMarble('-^-!');
    const svg = renderSVG(events);

    // サブスクリプション開始マーカーが含まれていることを確認
    expect(svg).toContain('subscribe');

    // サブスクリプション終了マーカーが含まれていることを確認
    expect(svg).toContain('unsubscribe');
  });

  it('特殊文字をエスケープする', () => {
    const events = parseMarble('---a---|', { values: { a: '<test>' } });
    const svg = renderSVG(events);

    // 特殊文字がエスケープされていることを確認
    expect(svg).toContain('&lt;test&gt;');
    expect(svg).not.toContain('<test>');
  });
});
