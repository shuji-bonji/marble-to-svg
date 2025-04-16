/**
 * 描画関数：完了イベント
 */
function renderCompleteEvent(
  x: number,
  timelineY: number,
  complete: any
): string {
  let s = '';
  s += `<line x1="${x}" y1="${timelineY - complete.height / 2}" x2="${x}" y2="${
    timelineY + complete.height / 2
  }" stroke="${complete.stroke}" stroke-width="${complete.strokeWidth}" />`;
  s += `<path d="M ${x - 5} ${timelineY - complete.height / 2} L ${x} ${
    timelineY - complete.height / 2 - 5
  } L ${x + 5} ${timelineY - complete.height / 2} Z" fill="${
    complete.stroke
  }" />`;
  return s;
}

/**
 * 描画関数：エラーイベント
 */
function renderErrorEvent(x: number, timelineY: number, error: any): string {
  let s = '';
  const errorSize = error.size;
  s += `<line x1="${x}" y1="${timelineY - errorSize / 2}" x2="${x}" y2="${
    timelineY + errorSize / 2
  }" stroke="${error.stroke}" stroke-width="${error.strokeWidth}" />`;
  s += `<path d="M ${x - errorSize / 2} ${timelineY - errorSize / 2} L ${
    x + errorSize / 2
  } ${timelineY + errorSize / 2} M ${x - errorSize / 2} ${
    timelineY + errorSize / 2
  } L ${x + errorSize / 2} ${timelineY - errorSize / 2}" stroke="${
    error.stroke
  }" stroke-width="${error.strokeWidth}" />`;
  return s;
}

/**
 * 描画関数：次の値イベント
 */
function renderNextEvent(
  x: number,
  timelineY: number,
  markers: any,
  notification: any
): string {
  let s = '';
  const value = String(
    notification.value !== undefined ? notification.value : ''
  );
  s += `<circle cx="${x}" cy="${timelineY}" r="${markers.radius}" fill="${markers.fill}" stroke="${markers.stroke}" stroke-width="${markers.strokeWidth}" />`;
  s += `<text x="${x}" y="${
    timelineY + markers.fontSize / 3
  }" text-anchor="middle" font-size="${markers.fontSize}" fill="${
    markers.textFill
  }">${escapeXml(value)}</text>`;
  return s;
}

/**
 * 描画関数：サブスクライブマーカー
 */
function renderSubscribeMarker(
  x: number,
  timelineY: number,
  subscription: any
): string {
  let s = '';
  s += `<line x1="${x}" y1="${
    timelineY - subscription.height / 2
  }" x2="${x}" y2="${timelineY + subscription.height / 2}" stroke="${
    subscription.stroke
  }" stroke-width="${subscription.strokeWidth}" stroke-dasharray="3,1" />`;
  s += `<text x="${x + 2}" y="${
    timelineY - subscription.height / 2 - 5
  }" font-size="10" fill="${subscription.stroke}">subscribe</text>`;
  return s;
}

/**
 * 描画関数：アンサブスクライブマーカー
 */
function renderUnsubscribeMarker(
  x: number,
  timelineY: number,
  subscription: any
): string {
  let s = '';
  s += `<line x1="${x}" y1="${
    timelineY - subscription.height / 2
  }" x2="${x}" y2="${timelineY + subscription.height / 2}" stroke="${
    subscription.stroke
  }" stroke-width="${subscription.strokeWidth}" stroke-dasharray="2,1" />`;
  s += `<text x="${x + 2}" y="${
    timelineY - subscription.height / 2 - 5
  }" font-size="10" fill="${subscription.stroke}">unsubscribe</text>`;
  return s;
}
import {
  DeepPartial,
  MarbleEvent,
  NotificationKind,
  RenderOptions,
  SubscriptionKind,
} from '../types';
import { DEFAULT_RENDER_OPTIONS } from '../utils/constants';

/**
 * MarbleEvent[]をSVG文字列に変換する
 * @param events MarbleEventの配列
 * @param options レンダリングオプション
 * @returns SVG文字列
 */
export function renderSVG<T = any>(
  events: MarbleEvent<T>[],
  options?: DeepPartial<RenderOptions>
): string {
  const opts = deepMerge(DEFAULT_RENDER_OPTIONS, options);
  const {
    width,
    height,
    margin,
    timeline,
    markers,
    complete,
    error,
    subscription,
    frameWidth,
  } = opts;

  // 実際の描画領域のサイズを計算
  const drawingWidth = opts.width - (opts.margin.left + opts.margin.right);
  const drawingHeight = opts.height - (opts.margin.top + opts.margin.bottom);

  // 最大フレーム番号を取得
  const maxFrame = Math.max(...events.map((e) => e.frame), 0);

  // フレーム番号から座標への変換関数
  const frameToX = (frame: number): number => {
    return margin.left + frame * frameWidth;
  };

  // ヘッダー（SVGタグ、スタイル）を生成
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  // タイムライン（軸）を描画
  const timelineY = margin.top + drawingHeight / 2;
  svg += `<line x1="${margin.left}" y1="${timelineY}" x2="${
    margin.left + Math.min(drawingWidth, (maxFrame + 1) * frameWidth)
  }" y2="${timelineY}" stroke="${timeline.stroke}" stroke-width="${
    timeline.strokeWidth
  }" />`;

  // フレームごとの目盛りを描画
  for (let i = 0; i <= maxFrame + 1; i++) {
    const x = frameToX(i);
    svg += `<line x1="${x}" y1="${
      timelineY - timeline.tickLength
    }" x2="${x}" y2="${timelineY + timeline.tickLength}" stroke="${
      timeline.stroke
    }" stroke-width="${timeline.strokeWidth}" />`;
  }

  // サブスクリプション開始/終了イベントを描画
  const subscribeEvents = events.filter(
    (e) => (e.notification as any).kind === SubscriptionKind.SUBSCRIBE
  );
  const unsubscribeEvents = events.filter(
    (e) => (e.notification as any).kind === SubscriptionKind.UNSUBSCRIBE
  );

  subscribeEvents.forEach((e) => {
    const x = frameToX(e.frame);
    svg += renderSubscribeMarker(x, timelineY, subscription);
  });

  unsubscribeEvents.forEach((e) => {
    const x = frameToX(e.frame);
    svg += renderUnsubscribeMarker(x, timelineY, subscription);
  });

  // 各イベントを処理
  events.forEach((event) => {
    const { frame, notification } = event;
    const x = frameToX(frame);
    if (notification.kind === NotificationKind.COMPLETE) {
      svg += renderCompleteEvent(x, timelineY, complete);
      return;
    }
    if (notification.kind === NotificationKind.ERROR) {
      svg += renderErrorEvent(x, timelineY, error);
      return;
    }
    if (notification.kind === NotificationKind.NEXT) {
      svg += renderNextEvent(x, timelineY, markers, notification);
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
// function getTextWidth(text: string, fontSize: number): number {
//   // 簡易的な計算：文字数 * フォントサイズの0.6倍
//   return text.length * fontSize * 0.6;
// }

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

/**
 * オプションは指定するプロパティのみを設定したいため、RenderOptionsにマージする
 * @param base 初期値が入っているRenderOptions
 * @param override オーバーライドしたいプロパティがあるRenderOptions
 * @returns マージしたRenderOptions
 */
function deepMerge<T>(base: T, override?: DeepPartial<T>): T {
  if (!override) return base;
  const result = { ...base };
  for (const key in override) {
    if (
      override[key] &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(base[key], override[key] as any);
    } else {
      result[key] = override[key] as any;
    }
  }
  return result;
}
