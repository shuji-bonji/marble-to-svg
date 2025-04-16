import { parseMarble } from '../parser/parseMarble';
import { renderSVG } from '../renderer/renderSVG';
import { RenderOptions, ParseOptions } from '../types';

/**
 * マーブルビューワーコンポーネント
 * マーブル記法の入力を受け取り、SVGを生成・表示する
 */
export class MarbleViewer {
  private container: HTMLElement;
  private inputElement!: HTMLTextAreaElement;
  private valuesElement!: HTMLTextAreaElement;
  private renderButton!: HTMLButtonElement;
  private svgContainer!: HTMLDivElement;
  private downloadButton!: HTMLButtonElement;
  private renderOptions: Partial<RenderOptions>;
  private lastSvg: string = '';

  /**
   * コンストラクタ
   * @param containerId コンテナ要素のID
   * @param renderOptions レンダリングオプション
   */
  constructor(containerId: string, renderOptions: Partial<RenderOptions> = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id '${containerId}' not found`);
    }

    this.container = container;
    this.renderOptions = renderOptions;

    this.createUI();
    this.bindEvents();
  }

  /**
   * UIを作成する
   */
  private createUI(): void {
    // コンテナをクリア
    this.container.innerHTML = '';

    // 入力フォームを作成
    const formDiv = document.createElement('div');
    formDiv.className = 'marble-form';

    // マーブル入力フィールド
    const marbleLabel = document.createElement('label');
    marbleLabel.textContent = 'マーブル記法：';
    marbleLabel.htmlFor = 'marble-input';

    this.inputElement = document.createElement('textarea');
    this.inputElement.id = 'marble-input';
    this.inputElement.rows = 3;
    this.inputElement.placeholder = '例: ---a---b---|';

    // 値マッピング入力フィールド
    const valuesLabel = document.createElement('label');
    valuesLabel.textContent = '値のマッピング（JSON形式）：';
    valuesLabel.htmlFor = 'values-input';

    this.valuesElement = document.createElement('textarea');
    this.valuesElement.id = 'values-input';
    this.valuesElement.rows = 3;
    this.valuesElement.placeholder = '例: { "a": "Hello", "b": "World" }';

    // レンダリングボタン
    this.renderButton = document.createElement('button');
    this.renderButton.textContent = 'SVG生成';
    this.renderButton.className = 'render-button';

    // SVG表示コンテナ
    this.svgContainer = document.createElement('div');
    this.svgContainer.className = 'svg-container';

    // ダウンロードボタン
    this.downloadButton = document.createElement('button');
    this.downloadButton.textContent = 'SVGをダウンロード';
    this.downloadButton.className = 'download-button';
    this.downloadButton.style.display = 'none'; // 初期状態では非表示

    // 要素を追加
    formDiv.appendChild(marbleLabel);
    formDiv.appendChild(this.inputElement);
    formDiv.appendChild(valuesLabel);
    formDiv.appendChild(this.valuesElement);
    formDiv.appendChild(this.renderButton);

    this.container.appendChild(formDiv);
    this.container.appendChild(this.svgContainer);
    this.container.appendChild(this.downloadButton);
  }

  /**
   * イベントをバインドする
   */
  private bindEvents(): void {
    // レンダリングボタンのクリックイベント
    this.renderButton.addEventListener('click', () => {
      this.render();
    });

    // Enterキーで自動レンダリング
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.render();
      }
    });

    // ダウンロードボタンのクリックイベント
    this.downloadButton.addEventListener('click', () => {
      this.downloadSvg();
    });
  }

  /**
   * マーブルをレンダリングする
   */
  private parseInput(): { events: any } | null {
    const marbleString = this.inputElement.value.trim();
    if (!marbleString) {
      this.showError('マーブル記法を入力してください');
      return null;
    }

    let values = {};
    const valuesString = this.valuesElement.value.trim();
    if (valuesString) {
      try {
        values = JSON.parse(valuesString);
      } catch (e) {
        this.showError('値のマッピングが不正なJSON形式です');
        return null;
      }
    }

    const parseOptions: ParseOptions = {
      values,
      includeSubscription: true,
    };

    const events = parseMarble(marbleString, parseOptions);
    return { events };
  }

  private generateSvg(events: any): string {
    const svg = renderSVG(events, this.renderOptions);
    this.lastSvg = svg;
    return svg;
  }

  private updateUi(svg: string): void {
    this.svgContainer.innerHTML = svg;
    this.showSuccess();
    this.downloadButton.style.display = 'block';
  }

  public render(): void {
    const result = this.parseInput();
    if (!result) return;
    const svg = this.generateSvg(result.events);
    this.updateUi(svg);
  }

  /**
   * SVGをダウンロードする
   */
  private downloadSvg(): void {
    if (!this.lastSvg) return;

    // SVGをBlobに変換
    const blob = new Blob([this.lastSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    // ダウンロードリンクを作成
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marble-diagram.svg';
    a.click();

    // URLを解放
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * エラーメッセージを表示
   * @param message エラーメッセージ
   */
  private showError(message: string): void {
    this.svgContainer.innerHTML = `<div class="error-message">${message}</div>`;
    this.downloadButton.style.display = 'none';
  }

  /**
   * 成功メッセージを表示
   */
  private showSuccess(): void {
    // エラーメッセージをクリア
    const errorElement = this.svgContainer.querySelector('.error-message');
    if (errorElement) errorElement.remove();
  }

  /**
   * 値をセットする
   * @param marbleString マーブル記法の文字列
   * @param values 値のマッピング
   */
  public setValues(
    marbleString: string,
    values: Record<string, any> = {}
  ): void {
    this.inputElement.value = marbleString;
    this.valuesElement.value = JSON.stringify(values, null, 2);
    this.render();
  }
}
