import { MarbleEvent, RenderOptions } from '../types';
import { DEFAULT_RENDER_OPTIONS, NOTIFICATION_KIND } from '../utils/constants';

/**
 * MarbleEvent[]をSVG文字列に変換する
 * @param events MarbleEventの配列
 * @param options レンダリングオプション
 * @returns SVG文字列
 */
export function renderSVG<T = any>(
  events: MarbleEvent<T>[],
  options: Partial<RenderOptions> = {}
): string {
  const opts:RenderOptions = { ...DEFAULT_RENDER_OPTIONS, ...options } ;
  const { width, height, margin, timeline, markers, complete, error, subscription, frameWidth } = opts;
  
  // 実際の描画領域のサイズを計算
  const drawingWidth = opts.width - (opts.margin.left + opts.margin.right);
  const drawingHeight = opts.height - (opts.margin.top + opts.margin.bottom);
  
  // 最大フレーム番号を取得
  const maxFrame = Math.max(...events.map(e => e.frame), 0);
  
  // フレーム番号から座標への変換関数
  const frameToX = (frame: number): number => {
    return margin.left + (frame * frameWidth);
  };
  
  // ヘッダー（SVGタグ、スタイル）を生成
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  
  // タイムライン（軸）を描画
  const timelineY = margin.top + (drawingHeight / 2);
  svg += `<line x1="${margin.left}" y1="${timelineY}" x2="${margin.left + Math.min(drawingWidth, (maxFrame + 1) * frameWidth)}" y2="${timelineY}" stroke="${timeline.stroke}" stroke-width="${timeline.strokeWidth}" />`;
  
  // フレームごとの目盛りを描画
  for (let i = 0; i <= maxFrame + 1; i++) {
    const x = frameToX(i);
    svg += `<line x1="${x}" y1="${timelineY - timeline.tickLength}" x2="${x}" y2="${timelineY + timeline.tickLength}" stroke="${timeline.stroke}" stroke-width="${timeline.strokeWidth}" />`;
  }
  
  // サブスクリプション開始/終了イベントを描画
  const subscribeEvents = events.filter(e => (e.notification as any).kind === 'S');
  const unsubscribeEvents = events.filter(e => (e.notification as any).kind === 'U');
  
  subscribeEvents.forEach(e => {
    const x = frameToX(e.frame);
    svg += `<line x1="${x}" y1="${timelineY - subscription.height / 2}" x2="${x}" y2="${timelineY + subscription.height / 2}" stroke="${subscription.stroke}" stroke-width="${subscription.strokeWidth}" stroke-dasharray="3,1" />`;
    svg += `<text x="${x + 2}" y="${timelineY - subscription.height / 2 - 5}" font-size="10" fill="${subscription.stroke}">subscribe</text>`;
  });
  
  unsubscribeEvents.forEach(e => {
    const x = frameToX(e.frame);
    svg += `<line x1="${x}" y1="${timelineY - subscription.height / 2}" x2="${x}" y2="${timelineY + subscription.height / 2}" stroke="${subscription.stroke}" stroke-width="${subscription.strokeWidth}" stroke-dasharray="2,1" />`;
    svg += `<text x="${x + 2}" y="${timelineY - subscription.height / 2 - 5}" font-size="10" fill="${subscription.stroke}">unsubscribe</text>`;
  });
  
  // 各イベントを処理
  events.forEach(event => {
    const { frame, notification } = event;
    const x = frameToX(frame);
    
    // 完了イベント
    if (notification.kind === NOTIFICATION_KIND.COMPLETE) {
      svg += `<line x1="${x}" y1="${timelineY - complete.height / 2}" x2="${x}" y2="${timelineY + complete.height / 2}" stroke="${complete.stroke}" stroke-width="${complete.strokeWidth}" />`;
      svg += `<path d="M ${x - 5} ${timelineY - complete.height / 2} L ${x} ${timelineY - complete.height / 2 - 5} L ${x + 5} ${timelineY - complete.height / 2} Z" fill="${complete.stroke}" />`;
      return;
    }
    
    // エラーイベント
    if (notification.kind === NOTIFICATION_KIND.ERROR) {
      const errorSize = error.size;
      svg += `<line x1="${x}" y1="${timelineY - errorSize/2}" x2="${x}" y2="${timelineY + errorSize/2}" stroke="${error.stroke}" stroke-width="${error.strokeWidth}" />`;
      svg += `<path d="M ${x - errorSize/2} ${timelineY - errorSize/2} L ${x + errorSize/2} ${timelineY + errorSize/2} M ${x - errorSize/2} ${timelineY + errorSize/2} L ${x + errorSize/2} ${timelineY - errorSize/2}" stroke="${error.stroke}" stroke-width="${error.strokeWidth}" />`;
      return;
    }
    
    // 次の値イベント
    if (notification.kind === NOTIFICATION_KIND.NEXT) {
      const value = String(notification.value !== undefined ? notification.value : '');
      // const textWidth = getTextWidth(value, markers.fontSize);
      // マーカー円を描画
      svg += `<circle cx="${x}" cy="${timelineY}" r="${markers.radius}" fill="${markers.fill}" stroke="${markers.stroke}" stroke-width="${markers.strokeWidth}" />`;
      // 値のテキストを描画
      svg += `<text x="${x}" y="${timelineY + markers.fontSize/3}" text-anchor="middle" font-size="${markers.fontSize}" fill="${markers.textFill}">${escapeXml(value)}</text>`;
    }
  });
  
  // SVGを閉じる
  svg += '</svg>';
  
  return svg;
}

/**
 * テキストの幅を推定する（おおよその計算）
 * @param text テキスト
 * @param fontSize フォントサイズ
 * @returns 推定幅
 */
function getTextWidth(text: string, fontSize: number): number {
  // 簡易的な計算：文字数 * フォントサイズの0.6倍
  return text.length * fontSize * 0.6;
}

/**
 * XMLテキスト内の特殊文字をエスケープする
 * @param text エスケープするテキスト
 * @returns エスケープされたテキスト
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}