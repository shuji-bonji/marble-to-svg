import {
  MarbleEvent,
  Notification,
  ParseOptions,
  MarbleFrame,
  SubscriptionNotification,
  NotificationKind,
  SubscriptionKind,
} from '../types';
import { MARBLE_SYNTAX, VALIDATION_PATTERNS } from '../utils/constants';

/**
 * マーブル記法の文字列をパースしてMarbleEvent[]に変換する
 * @param marbleString マーブル記法の文字列
 * @param options パースオプション
 * @returns MarbleEventの配列
 */
export function parseMarble<T = any>(
  marbleString: string,
  options: ParseOptions<T> = {}
): MarbleEvent<T>[] {
  const {
    values = {},
    error = new Error('Marble Error'),
    includeSubscription = true,
  } = options;

  // マーブル文字列から各フレームの情報を抽出
  const frames = parseMarbleToFrames(marbleString, includeSubscription);

  // フレーム情報をMarbleEvent[]に変換
  return framesToMarbleEvents(frames, values, error);
}

/**
 * マーブル文字列をフレーム情報に分解する
 * @param marbleString マーブル記法の文字列
 * @param includeSubscription サブスクリプション情報を含めるかどうか
 * @returns フレーム情報の配列
 */
const parseMarbleToFrames = (
  marbleString: string,
  includeSubscription: boolean
): MarbleFrame[] => {
  const frames: MarbleFrame[] = [];
  let frameIndex = 0;
  let inGroup = false;
  let currentGroupValues: string[] = [];

  for (const char of marbleString) {
    if (VALIDATION_PATTERNS.SPACE.test(char)) continue;

    switch (char) {
      case MARBLE_SYNTAX.GROUP_START: // グループ開始
        inGroup = true;
        currentGroupValues = [];
        break;

      case MARBLE_SYNTAX.GROUP_END: // グループ終了
        inGroup = false;
        // 現在のフレームにグループの値を設定
        if (currentGroupValues.length > 0) {
          ensureFrame(frames, frameIndex);
          frames[frameIndex].values.push(...currentGroupValues);
        }
        frameIndex++;
        break;

      case MARBLE_SYNTAX.FRAME: // 時間経過（フレーム）
        if (!inGroup) frameIndex++;
        break;

      case MARBLE_SYNTAX.COMPLETE:
      case MARBLE_SYNTAX.ERROR:
      case MARBLE_SYNTAX.SUBSCRIBE:
      case MARBLE_SYNTAX.UNSUBSCRIBE:
        ensureFrame(frames, frameIndex);
        // 完了通知
        if (char === MARBLE_SYNTAX.COMPLETE) frames[frameIndex].complete = true;
        // エラー通知
        if (char === MARBLE_SYNTAX.ERROR) frames[frameIndex].error = true;
        // 購読開始（Hot Observable）
        if (char === MARBLE_SYNTAX.SUBSCRIBE && includeSubscription)
          frames[frameIndex].subscribe = true;
        // 購読解除
        if (char === MARBLE_SYNTAX.UNSUBSCRIBE && includeSubscription)
          frames[frameIndex].unsubscribe = true;
        if (!inGroup) frameIndex++;
        break;

      default:
        // 値
        if (VALIDATION_PATTERNS.VALUE_CHAR.test(char)) {
          if (inGroup) {
            currentGroupValues.push(char);
          } else {
            ensureFrame(frames, frameIndex);
            frames[frameIndex].values.push(char);
            frameIndex++;
          }
        } else {
          // 無効な文字の場合はエラー
          throw new Error(
            `Invalid character "${char}" at position ${marbleString.indexOf(
              char
            )}`
          );
        }
    }
  }
  return frames;
};

/**
 * 指定されたインデックスのフレームが存在することを確認
 * 存在しない場合は作成する
 * @param frames フレーム配列
 * @param index フレームインデックス
 */
const ensureFrame = (frames: MarbleFrame[], index: number): void => {
  if (frames[index]) return;
  frames[index] = {
    index,
    values: [],
    complete: false,
    error: false,
  };
};

/**
 * フレーム情報をMarbleEvent[]に変換する
 * @param frames フレーム情報の配列
 * @param values 文字から値へのマッピング
 * @param error エラーオブジェクト
 * @returns MarbleEventの配列
 */
const framesToMarbleEvents = <T = any>(
  frames: MarbleFrame[],
  values: Record<string, T>,
  error: any
): MarbleEvent<T>[] => {
  const events: MarbleEvent<T>[] = [];
  // 各フレームを処理
  frames.forEach(
    ({
      index,
      values: valChars,
      complete,
      error: err,
      subscribe,
      unsubscribe,
    }) => {
      // 値のイベント
      valChars.forEach((char) => {
        const value = char in values ? values[char] : (char as any);
        events.push({
          frame: index,
          notification: createNotification(NotificationKind.NEXT, value),
        });
      });

      // 完了イベント
      if (complete)
        events.push({
          frame: index,
          notification: createNotification(NotificationKind.COMPLETE),
        });

      // エラーイベント
      if (err)
        events.push({
          frame: index,
          notification: createNotification(
            NotificationKind.ERROR,
            undefined,
            error
          ),
        });

      // 購読開始イベント
      if (subscribe)
        events.push({
          frame: index,
          notification: createSubscriptionNotification(
            SubscriptionKind.SUBSCRIBE
          ),
        });

      // 購読解除イベント
      if (unsubscribe)
        events.push({
          frame: index,
          notification: createSubscriptionNotification(
            SubscriptionKind.UNSUBSCRIBE
          ),
        });
    }
  );
  return events;
};

/**
 *
 * 通知の生成
 * @param kind 通知の種類（next / complete / error）
 * @param value 値
 * @param error エラー
 * @returns Notification
 */
function createNotification<T>(
  kind: NotificationKind.NEXT,
  value: T
): Notification<T>;
function createNotification(
  kind: NotificationKind.COMPLETE
): Notification<undefined>;
function createNotification(
  kind: NotificationKind.ERROR,
  value?: undefined,
  error?: any
): Notification<undefined>;
function createNotification<T>(
  kind: NotificationKind,
  value?: T,
  error?: any
): Notification<T> {
  switch (kind) {
    case NotificationKind.NEXT:
      return { kind, value: value! };
    case NotificationKind.COMPLETE:
      return { kind };
    case NotificationKind.ERROR:
      return { kind, error };
  }
}

/**
 * 購読通知の生成
 * @param kind  サブスクリプションの種類（subscribe / unsubscribe）
 * @returns SubscriptionNotification
 */
const createSubscriptionNotification = (
  kind: SubscriptionKind
): SubscriptionNotification => {
  return {
    kind,
    value: kind === 'S' ? 'subscribe' : 'unsubscribe',
  };
};
