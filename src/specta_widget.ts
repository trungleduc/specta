import { PromiseDelegate } from '@lumino/coreutils';
import { Message } from '@lumino/messaging';
import { Panel, Widget } from '@lumino/widgets';

import { SpectaCellOutput } from './specta_cell_output';
import { AppModel } from './specta_model';
import {
  ISpectaAppConfig,
  ISpectaLayout,
  ISpectaLayoutRegistry
} from './token';
import { emitResizeEvent, hideAppLoadingIndicator, isSpectaApp } from './tool';

export class AppWidget extends Panel {
  constructor(options: AppWidget.IOptions) {
    super();
    this.node.id = options.id;
    this.title.label = options.label;
    this.title.closable = true;
    this._model = options.model;
    this._spectaAppConfig = options.spectaConfig;
    this._layoutRegistry = options.layoutRegistry;
    this._host = new Panel();
    this._host.addClass('specta-output-host');
    this.addClass('specta-app-widget');
    this.addWidget(this._host);

    if (!isSpectaApp()) {
      // Not a specta app, add spinner
      this.addSpinner();
    }

    this._model.initialize().then(() => {
      this.render().catch(console.error).then(emitResizeEvent);
    });
    this._layoutRegistry.selectedLayoutChanged.connect(
      this._onSelectedLayoutChanged,
      this
    );
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

    const layout = this._spectaAppConfig?.defaultLayout ?? 'default';
    for (const cell of cellList) {
      const src = cell.sharedModel.source;
      if (src.length === 0) {
        continue;
      }
      const el = this._model.createCell(cell);
      this._model.executeCell(cell, el);

      this._outputs.push(el);
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
    const spectaLayout =
      this._layoutRegistry.get(layout) ??
      this._layoutRegistry.getDefaultLayout();
    await spectaLayout.render({
      host: this._host,
      items: this._outputs,
      notebook: this._model.context?.model.toJSON() as any,
      readyCallback,
      spectaConfig: this._spectaAppConfig
    });
  }

  protected onCloseRequest(msg: Message): void {
    this._model.dispose();
    super.onCloseRequest(msg);
  }

  private _onSelectedLayoutChanged(
    sender: ISpectaLayoutRegistry,
    args: { name: string; layout: ISpectaLayout; oldLayout?: ISpectaLayout }
  ): void {
    const { layout } = args;

    const currentEls = [...this._host.widgets];

    currentEls.forEach(el => {
      this._host.layout?.removeWidget(el);
    });
    layout.render({
      host: this._host,
      items: this._outputs,
      notebook: this._model.context?.model.toJSON() as any,
      readyCallback: async () => {},
      spectaConfig: this._spectaAppConfig
    });
  }
  private _model: AppModel;

  private _ready = new PromiseDelegate<void>();

  private _host: Panel;

  private _layoutRegistry: ISpectaLayoutRegistry;

  private _loaderHost?: Widget;

  private _outputs: SpectaCellOutput[] = [];

  private _spectaAppConfig: ISpectaAppConfig;
}

export namespace AppWidget {
  export interface IOptions {
    id: string;
    label: string;
    model: AppModel;
    layoutRegistry: ISpectaLayoutRegistry;
    spectaConfig: ISpectaAppConfig;
  }
}
