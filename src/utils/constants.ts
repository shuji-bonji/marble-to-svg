import { RenderOptions } from '../types';

/**
 * マーブル記法の特殊文字
 */
export const MARBLE_SYNTAX = {
  FRAME: '-', // 時間の経過（1フレーム）
  COMPLETE: '|', // 完了通知
  ERROR: '#', // エラー通知
  GROUP_START: '(', // グループ開始
  GROUP_END: ')', // グループ終了
  SUBSCRIBE: '^', // 購読開始
  UNSUBSCRIBE: '!', // 購読解除
};

/**
 * デフォルトのSVG描画設定
 */
export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  width: 800,
  height: 60,
  margin: {
    top: 20,
    right: 30,
    bottom: 10,
    left: 30,
  },
  timeline: {
    strokeWidth: 2,
    stroke: '#999',
    tickLength: 5,
  },
  markers: {
    radius: 15,
    stroke: '#555',
    strokeWidth: 1.5,
    fill: '#fff',
    textFill: '#333',
    fontSize: 12,
  },
  complete: {
    stroke: '#555',
    strokeWidth: 2,
    height: 30,
  },
  error: {
    stroke: '#d44',
    strokeWidth: 2,
    size: 15,
  },
  subscription: {
    stroke: '#080',
    strokeWidth: 1.5,
    height: 25,
  },
  frameWidth: 30,
};

/**
 * マーブル記法のバリデーションパターン
 */
export const VALIDATION_PATTERNS = {
  // 有効な値の文字
  VALUE_CHAR: /^[0-9a-zA-Z]$/,
  // スペース文字（無視される）
  SPACE: /^\s$/,
};
