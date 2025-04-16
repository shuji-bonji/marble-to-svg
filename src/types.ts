/**
 * 通知の種類
 */
export type NotificationKind = 'N' | 'C' | 'E';

/**
 * 通知オブジェクト
 * 
 */
export interface Notification<T = any> {
  kind: NotificationKind;
  value?: T;
  error?: any;
}
// T:
// - マーブル記法 a の値として数値 1 をマッピングする場合: value: 1
// - マーブル記法 b の値としてオブジェクト { id: 1, name: 'test' } をマッピングする場合: value: { id: 1, name: 'test' }
// - マーブル記法 c の値として配列 [1, 2, 3] をマッピングする場合: value: [1, 2, 3]

/**
 * サブスクリプション通知の種類
 */
export type SubscriptionKind = 'S' | 'U';

/**
 * サブスクリプション通知オブジェクト
 */
export interface SubscriptionNotification {
  kind: SubscriptionKind;
  value: 'subscribe' | 'unsubscribe';
}

/**
 * マーブルイベント
 */
export interface MarbleEvent<T = any> {
  frame: number;
  notification: Notification<T> | SubscriptionNotification;
}

/**
 * SVG描画設定
 */
export interface RenderOptions {
  // SVGの全体サイズ
  width: number;
  height: number;
  // マージン
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  // 時間軸の設定
  timeline: {
    strokeWidth: number;
    stroke: string;
    tickLength: number;
  };
  // マーカー（Nextイベント）の設定
  markers: {
    radius: number;
    stroke: string;
    strokeWidth: number;
    fill: string;
    textFill: string;
    fontSize: number;
  };
  // 完了マーカーの設定
  complete: {
    stroke: string;
    strokeWidth: number;
    height: number;
  };
  // エラーマーカーの設定
  error: {
    stroke: string;
    strokeWidth: number;
    size: number;
  };
  // サブスクリプションマーカーの設定
  subscription: {
    stroke: string;
    strokeWidth: number;
    height: number;
  };
  // フレームごとの幅（ピクセル）
  frameWidth: number;
}

/**
 * マーブルパース設定
 */
export interface ParseOptions<T = any> {
  // 文字から値へのマッピング
  values?: Record<string, T>;
  // エラーオブジェクト
  error?: any;
  // サブスクリプションフレーム情報を含むかどうか
  includeSubscription?: boolean;
}

/**
 * マーブルフレームの内部表現
 */
export interface MarbleFrame {
  index: number;  // フレームのインデックス
  values: string[];  // このフレームで発生する値
  complete: boolean;  // 完了フラグ
  error: boolean;  // エラーフラグ
  subscribe?: boolean;  // 購読開始フラグ（Hot Observable）
  unsubscribe?: boolean;  // 購読解除フラグ
}