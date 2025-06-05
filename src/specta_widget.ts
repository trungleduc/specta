import { SimplifiedOutputArea } from '@jupyterlab/outputarea';
import { PromiseDelegate } from '@lumino/coreutils';
import { Message } from '@lumino/messaging';
import { Panel, Widget } from '@lumino/widgets';

import { SpectaCellOutput } from './specta_cell_output';
import { AppModel } from './specta_model';
import { ISpectaLayoutRegistry } from './token';
import { hideAppLoadingIndicator, isSpectaApp } from './tool';

export class AppWidget extends Panel {
  constructor(options: AppWidget.IOptions) {
    super();
    this.node.id = options.id;
    this.title.label = options.label;
    this.title.closable = true;
    this._model = options.model;
    this._layoutRegistry = options.layoutRegistry;
    this.node.style.padding = '5px';
    this._host = new Panel();
    this._host.addClass('specta-output-host');
    this.addWidget(this._host);

    this.node.style.overflow = 'auto';

    if (!isSpectaApp()) {
      // Not a specta app, add spinner
      this.addSpinner();
    }

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

  addSpinner(): void {
    const loaderHost = (this._loaderHost = new Widget());
    loaderHost.addClass('specta-loader-host');
    const spinner = document.createElement('div');
    spinner.className = 'specta-loader';
    loaderHost.node.appendChild(spinner);
    const text = document.createElement('div');
    text.className = 'specta-loading-indicator-text';
    text.textContent = 'Loading Specta';
    loaderHost.node.appendChild(text);
    this.addWidget(loaderHost);
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._model.dispose();
    super.dispose();
  }

  async render(): Promise<void> {
    const cellList = this._model.cells ?? [];
    const outputs: SpectaCellOutput[] = [];
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
      outputs.push(el);
    }
    const readyCallback = async () => {
      if (this._loaderHost) {
        this._loaderHost.node.style.opacity = '0';
        setTimeout(() => {
          this.layout?.removeWidget(this._loaderHost!);
        }, 100);
      } else {
        hideAppLoadingIndicator();
      }
    };
    await this._layoutRegistry.selectedLayout.layout.render({
      host: this._host,
      items: outputs,
      notebook: this._model.context.model.toJSON() as any,
      readyCallback
    });
  }

  protected onCloseRequest(msg: Message): void {
    this._model.dispose();
    super.onCloseRequest(msg);
  }

  private _model: AppModel;

  private _ready = new PromiseDelegate<void>();

  private _host: Panel;

  private _layoutRegistry: ISpectaLayoutRegistry;

  private _loaderHost?: Widget;
}

export namespace AppWidget {
  export interface IOptions {
    id: string;
    label: string;
    model: AppModel;
    layoutRegistry: ISpectaLayoutRegistry;
  }
}
