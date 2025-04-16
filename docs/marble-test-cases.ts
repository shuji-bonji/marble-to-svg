export type MarbleCase = {
  description: string;
  marble: string;
  note?: string;
};

export const marbleTestCases: MarbleCase[] = [
  // 値の流れ（基本）
  {
    description: '単一の値だけ',
    marble: '--a--|',
  },
  {
    description: '複数の値（時間差あり）',
    marble: '--a--b--c--|',
  },
  {
    description: '同期の複数値',
    marble: '--(abc)--|',
    note: '同じタイミングで複数の値をemitする',
  },
  {
    description: '完了せずに止まる（incomplete）',
    marble: '--a--b--c--',
  },

  // エラー
  {
    description: '途中でエラーが発生',
    marble: '--a--#',
  },
  {
    description: '値とエラーの複合',
    marble: '--a--b--#',
  },

  // サブスクリプション制御
  {
    description: 'hot observable（^でサブスク開始を示す）',
    marble: '---a--b--c--|',
    note: '^はパーサーで無視可能。視覚的に開始点を描画するかは任意',
  },
  {
    description: '途中でunsubscribe（!）',
    marble: '--a--b--!',
    note: '表示的にはキャンセルマークや×印でもよい',
  },

  // タイムラインだけ
  {
    description: '時間経過だけ（no event）',
    marble: '-----------|',
  },
  {
    description: 'completeもerrorもなし',
    marble: '-----------',
  },

  // 複合パターン
  {
    description: '同期値のあと非同期値とcomplete',
    marble: '--(ab)--c--|',
  },
  {
    description: '値、エラー、unsubscribe混在',
    marble: '--a--b--#--!',
    note: '普通は # が来た時点で終了とするが、表示テスト用に混在させる',
  },

  // 拡張構文の候補（将来対応）
  {
    description: 'タイミング指定（run()用）',
    marble: '1s a 500ms b 250ms |',
    note: 'Phase 2で parseMarbleWithTiming() 対応予定',
  },
];
