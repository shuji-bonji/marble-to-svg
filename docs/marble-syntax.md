# RxJS Marble Diagram 構文仕様（TestScheduler 用）

RxJSのTestSchedulerで使用されるMarble diagramsの構文仕様についてまとめます。これはRxJSのテストコードで使用されるもので、時間の経過とともに発生するObservableのイベントを視覚的に表現します。

## 概要

RxJS の TestScheduler にて使用されるマーブル記法は、Observable の時間経過と通知イベントを、1文字1フレームの擬似時間軸で表現する DSL（ドメイン特化言語） です。

## 基本構文
Marble diagramsは単純な文字列表現で、時間の経過と共に発生するObservableのイベントを表します。基本的に以下の文字が使用されます。

|記号/文字|説明|
|---|---|
|`-`|時間の経過（1フレーム）|
|`[0-9a-z]`（数字またはアルファベット）|値を持つnext通知（任意の1文字）|
|`\|`|完了通知（complete）|
|`#`|エラー通知（error）|
|`()`|同じフレームで発生する複数の値をグループ化（同期通知）例: (abc)|
|`^`|購読開始を示す（Hot Observableでのみ使用）|
|`!`|購読解除を示す（unsubscribed）|
|` `|空白。無視される（見やすさのための装飾）|


## フレームと時間の概念

### 1. 時間の表現

- 各文字（`-`を含む）は1フレーム（デフォルトでは10ms）を表します
- 例：`---a---b---|` は "30ms後にa、さらに40ms後にb、そして40ms後に完了" を意味します
- 先頭のスペースや改行は無視される

### 2. 値の表現

- 単一の文字（例：`a`, `1`, `x`）は値を表します
- 複数文字の値を表現する場合は、parseMarble関数の第2引数にマッピングを指定します
  ```ts
  parseMarble('---a---b---|', { a: 'Hello', b: 'World' })
  ```
### 3. 同時発生イベント

- 同じフレームで複数のイベントが発生する場合、括弧`()`で囲みます
- 例：`---(abc)--|` は、3つの値 a, b, c が同じフレームで発生し、その後完了することを意味します

### 4. 特別なイベント

- 完了：`|` 
- エラー：`#`（第3引数にErrorオブジェクトを指定可能）
- 購読開始（Hot Observable）：`^`
- 購読解除：`!`

### 5. グループ

- グループ文字 `(` と `)` の間の文字はすべて同じフレームで発生します
- 例：`---(abc)---` は、3つの値が同じフレームで発生することを意味します

## パターン例

1. 基本の値通知と完了
   ```
   --a--b--c--|
   ```
2. エラー通知
   ```
   --a--#    
   ```
3. 同期の複数値
   ```
   --(abc)--|
   ```
4. サブスクリプションの示唆（Hot observable向け）
   ```
   -a---b---c---|
   ^            // subscribe point
   ```
5. サブスクリプション終了を含む
   ```
   --a--b--!
   ```

## 複数行マーブルの対応

RxJSの run() テスト形式では、複数行を以下のように比較で使用します。

```js
testScheduler.run(({ cold, expectObservable }) => {
  const source = cold('--a--b--|');
  const expected =    '--a--b--|';
  expectObservable(source).toBe(expected);
});
```

- 複数行を整列することで、時間軸比較が可能になる
- 各行は同一フレーム単位で意味を持つ


## parseMarble関数

```ts
// 基本的な使用方法
parseMarble(marbleString, values?, error?): MarbleEvent[]
```

### パラメータ

1. `marbleString`: Marble表記の文字列
2. `values?`: 文字から実際の値へのマッピングオブジェクト（オプション）
3. `error?`: `#`記号で表されるエラーオブジェクト（オプション）

### 戻り値

MarbleEvent[]の形式で、各イベントには以下のプロパティがあります：
- `frame`: イベントが発生するフレーム番号
- `notification`: 通知の種類と値を含むオブジェクト
  - `kind`: 'N'（next）、'E'（error）、'C'（complete）のいずれか
  - `value`: 値（next通知の場合のみ）
  - `error`: エラーオブジェクト（error通知の場合のみ）

## 使用例

```ts
// Cold Observable（購読開始時間がマーブル文字列の先頭）
testScheduler.run(({ cold, expectObservable }) => {
  const source$ = cold('--a--b--|', { a: 'Hello', b: 'World' });
  expectObservable(source$).toBe('--a--b--|', { a: 'Hello', b: 'World' });
});

// Hot Observable（購読開始時間を ^ で指定）
testScheduler.run(({ hot, expectObservable }) => {
  const source$ = hot('-a-^-b--c-|', { a: 'ignored', b: 'Hello', c: 'World' });
  expectObservable(source$).toBe('--b--c-|', { b: 'Hello', c: 'World' });
});
```

## 特記事項

- スペースは無視されます（可読性のために使用可能）
- デフォルトのフレーム長は10msですが、TestSchedulerの作成時に変更可能です
- TestScheduler.runメソッドを使用する場合、仮想時間が使用されるため実際の時間経過はありません
- マーブル文字列の解析は厳密であり、無効な構文はエラーを引き起こします
