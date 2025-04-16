import { describe, it, expect } from 'vitest';
import { parseMarble } from '../src/parser/parseMarble';
import { NOTIFICATION_KIND } from '../src/utils/constants';

describe('parseMarble', () => {
  it('基本的な文字列をパースできる', () => {
    const result = parseMarble('---a---b---|');
    
    expect(result).toHaveLength(3);
    
    // 最初のイベント（a）
    expect(result[0].frame).toBe(3);
    expect(result[0].notification.kind).toBe(NOTIFICATION_KIND.NEXT);
    expect(result[0].notification.value).toBe('a');
    
    // 2番目のイベント（b）
    expect(result[1].frame).toBe(7);
    expect(result[1].notification.kind).toBe(NOTIFICATION_KIND.NEXT);
    expect(result[1].notification.value).toBe('b');
    
    // 完了イベント
    expect(result[2].frame).toBe(11);
    expect(result[2].notification.kind).toBe(NOTIFICATION_KIND.COMPLETE);
  });
  
  it('値のマッピングを適用できる', () => {
    const values = { a: 'Hello', b: 'World' };
    const result = parseMarble('---a---b---|', { values });
    
    expect(result[0].notification.value).toBe('Hello');
    expect(result[1].notification.value).toBe('World');
  });
  
  it('エラーイベントをパースできる', () => {
    const customError = new Error('カスタムエラー');
    const result = parseMarble('---a---#', { error: customError });
    
    expect(result).toHaveLength(2);
    expect(result[1].notification.kind).toBe(NOTIFICATION_KIND.ERROR);
    expect(result[1].notification.error).toBe(customError);
  });
  
  it('グループをパースできる', () => {
    const result = parseMarble('---(abc)---|');
    
    // グループ内の3つのイベントが同じフレームに配置される
    expect(result[0].frame).toBe(3);
    expect(result[1].frame).toBe(3);
    expect(result[2].frame).toBe(3);
    
    expect(result[0].notification.value).toBe('a');
    expect(result[1].notification.value).toBe('b');
    expect(result[2].notification.value).toBe('c');
  });
  
  it('Hot Observableの購読情報を含める', () => {
    const result = parseMarble('-a-^-b---|');
    
    // 購読前のイベントも含まれる
    expect(result[0].frame).toBe(1);
    expect(result[0].notification.value).toBe('a');
    
    // 購読開始イベント
    expect(result[1].frame).toBe(3);
    expect((result[1].notification as any).kind).toBe('S');
    
    // 購読後のイベント
    expect(result[2].frame).toBe(5);
    expect(result[2].notification.value).toBe('b');
  });
  
  it('購読解除イベントをパースできる', () => {
    const result = parseMarble('---a---!');
    
    expect(result).toHaveLength(2);
    expect(result[1].frame).toBe(7);
    expect((result[1].notification as any).kind).toBe('U');
  });
  
  it('空のオブザーバブルをパースできる', () => {
    const result = parseMarble('--|');
    
    expect(result).toHaveLength(1);
    expect(result[0].frame).toBe(2);
    expect(result[0].notification.kind).toBe(NOTIFICATION_KIND.COMPLETE);
  });
  
  it('無効な文字でエラーを投げる', () => {
    expect(() => parseMarble('---a---?')).toThrow();
  });
});