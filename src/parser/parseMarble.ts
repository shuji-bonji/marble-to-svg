import { MarbleEvent, Notification, ParseOptions, MarbleFrame } from '../types';
import { MARBLE_SYNTAX, NOTIFICATION_KIND, VALIDATION_PATTERNS } from '../utils/constants';

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
  const { values = {}, error = new Error('Marble Error'), includeSubscription = true } = options;
  
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
function parseMarbleToFrames(
  marbleString: string,
  includeSubscription: boolean
): MarbleFrame[] {
  const frames: MarbleFrame[] = [];
  let frameIndex = 0;
  let inGroup = false;
  let currentGroupValues: string[] = [];
  
  // 文字列を1文字ずつ処理
  for (let i = 0; i < marbleString.length; i++) {
    const char = marbleString[i];
    
    // スペースは無視
    if (VALIDATION_PATTERNS.SPACE.test(char)) {
      continue;
    }
    
    // グループ開始
    if (char === MARBLE_SYNTAX.GROUP_START) {
      inGroup = true;
      currentGroupValues = [];
      continue;
    }
    
    // グループ終了
    if (char === MARBLE_SYNTAX.GROUP_END) {
      inGroup = false;
      // 現在のフレームにグループの値を設定
      if (currentGroupValues.length > 0) {
        ensureFrame(frames, frameIndex);
        frames[frameIndex].values.push(...currentGroupValues);
      }
      frameIndex++;
      continue;
    }
    
    // 時間経過（フレーム）
    if (char === MARBLE_SYNTAX.FRAME) {
      if (!inGroup) {
        frameIndex++;
      }
      continue;
    }
    
    // 完了通知
    if (char === MARBLE_SYNTAX.COMPLETE) {
      ensureFrame(frames, frameIndex);
      frames[frameIndex].complete = true;
      if (!inGroup) {
        frameIndex++;
      }
      continue;
    }
    
    // エラー通知
    if (char === MARBLE_SYNTAX.ERROR) {
      ensureFrame(frames, frameIndex);
      frames[frameIndex].error = true;
      if (!inGroup) {
        frameIndex++;
      }
      continue;
    }
    
    // 購読開始（Hot Observable）
    if (char === MARBLE_SYNTAX.SUBSCRIBE && includeSubscription) {
      ensureFrame(frames, frameIndex);
      frames[frameIndex].subscribe = true;
      if (!inGroup) {
        frameIndex++;
      }
      continue;
    }
    
    // 購読解除
    if (char === MARBLE_SYNTAX.UNSUBSCRIBE && includeSubscription) {
      ensureFrame(frames, frameIndex);
      frames[frameIndex].unsubscribe = true;
      if (!inGroup) {
        frameIndex++;
      }
      continue;
    }
    
    // 値
    if (VALIDATION_PATTERNS.VALUE_CHAR.test(char)) {
      if (inGroup) {
        currentGroupValues.push(char);
      } else {
        ensureFrame(frames, frameIndex);
        frames[frameIndex].values.push(char);
        frameIndex++;
      }
      continue;
    }
    
    // 無効な文字の場合はエラー
    throw new Error(`Invalid character "${char}" at position ${i} in marble string`);
  }
  
  return frames;
}

/**
 * フレーム情報をMarbleEvent[]に変換する
 * @param frames フレーム情報の配列
 * @param values 文字から値へのマッピング
 * @param error エラーオブジェクト
 * @returns MarbleEventの配列
 */
function framesToMarbleEvents<T = any>(
  frames: MarbleFrame[],
  values: Record<string, T>,
  error: any
): MarbleEvent<T>[] {
  const events: MarbleEvent<T>[] = [];
  
  // 各フレームを処理
  frames.forEach(frame => {
    // 値のイベント
    frame.values.forEach(value => {
      const notification: Notification<T> = {
        kind: NOTIFICATION_KIND.NEXT,
        value: value in values ? values[value] : value as any
      };
      events.push({
        frame: frame.index,
        notification
      });
    });
    
    // 完了イベント
    if (frame.complete) {
      const notification: Notification<T> = {
        kind: NOTIFICATION_KIND.COMPLETE
      };
      events.push({
        frame: frame.index,
        notification
      });
    }
    
    // エラーイベント
    if (frame.error) {
      const notification: Notification<T> = {
        kind: NOTIFICATION_KIND.ERROR,
        error
      };
      events.push({
        frame: frame.index,
        notification
      });
    }
    
    // 購読開始イベント
    if (frame.subscribe) {
      events.push({
        frame: frame.index,
        notification: {
          kind: 'S', // 特殊なキンド
          value: 'subscribe'  as any
        }
      });
    }
    
    // 購読解除イベント
    if (frame.unsubscribe) {
      events.push({
        frame: frame.index,
        notification: {
          kind: 'U', // 特殊なキンド
          value: 'unsubscribe' as any
        }
      });
    }
  });
  
  return events;
}

/**
 * 指定されたインデックスのフレームが存在することを確認
 * 存在しない場合は作成する
 * @param frames フレーム配列
 * @param index フレームインデックス
 */
function ensureFrame(frames: MarbleFrame[], index: number): void {
  if (!frames[index]) {
    frames[index] = {
      index,
      values: [],
      complete: false,
      error: false
    };
  }
}