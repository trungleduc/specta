import { SimplifiedOutputArea } from '@jupyterlab/outputarea';
import { PromiseDelegate } from '@lumino/coreutils';
import { Message } from '@lumino/messaging';
import { Panel } from '@lumino/widgets';

import { SpectaCellOutput } from './specta_cell_output';
import { AppModel } from './specta_model';

export class AppWidget extends Panel {
  constructor(options: AppWidget.IOptions) {
    super();
    this.node.id = options.id;
    this.title.label = options.label;
    this.title.closable = true;
    this._model = options.model;

    this._host = new Panel();
    this._host.addClass('specta-output-host');
    this.addWidget(this._host);

    this._spinner = document.createElement('div');
    this._spinner.classList.add('jp-al-Spinner');
    const spinner = document.createElement('div');
    spinner.className = 'jp-al-SpinnerContent';
    this._spinner.appendChild(spinner);
    this.node.appendChild(this._spinner);

    this.node.style.overflow = 'auto';

    this._model.initialize().then(() => {
      this.render()
        .catch(console.error)
        .then(() => window.dispatchEvent(new Event('resize')));
    });
  }

  /**
   * A promise that is fulfilled when the model is ready.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  get model(): AppModel {
    return this._model;
  }
  get gridWidgets(): Array<SpectaCellOutput> {
    return this._gridElements;
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._model.dispose();
    super.dispose();
  }
  addGridItem(out: SpectaCellOutput): void {
    this._gridElements.push(out);
    const info = out.info;

    if (info && info.hidden) {
      return;
    }
    this._host.addWidget(out);
  }

  async render(): Promise<void> {
    const cellList = this._model.cells ?? [];
    for (const cell of cellList) {
      const src = cell.sharedModel.source;
      if (src.length === 0) {
        continue;
      }
      const el = this._model.createCell(cell);
      await this._model.executeCell(
        cell,
        el.cellOutput as SimplifiedOutputArea
      );
      const outputNode = el.cellOutput.node;
      if (outputNode.childNodes.length > 0) {
        this.addGridItem(el);
      }
    }
    this.node.removeChild(this._spinner);
  }

  protected onCloseRequest(msg: Message): void {
    this._model.dispose();
    super.onCloseRequest(msg);
  }

  private _model: AppModel;

  private _ready = new PromiseDelegate<void>();

  private _host: Panel;

  private _gridElements: SpectaCellOutput[] = [];

  private _spinner: HTMLElement;
}

export namespace AppWidget {
  export interface IOptions {
    id: string;
    label: string;
    model: AppModel;
  }
}
