import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import {
  INotebookModel,
  INotebookTracker,
  NotebookPanel
} from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ServiceManager } from '@jupyterlab/services';
import { ISessionContext } from '@jupyterlab/apputils';
import { Signal } from '@lumino/signaling';
import { Widget } from '@lumino/widgets';
import { SpectaWidgetFactory } from '../specta_widget_factory';
import { AppWidget } from '../specta_widget';

export interface ISpectaOptions {
  manager: ServiceManager;
  rendermime: IRenderMimeRegistry;
  tracker: INotebookTracker;
  contentFactory: NotebookPanel.IContentFactory;
  mimeTypeService: IEditorMimeTypeService;
}

export class NotebookSpectaDocWidget extends DocumentWidget<
  NotebookSpectaPanel,
  INotebookModel
> {
  constructor(
    private options: DocumentWidget.IOptions<
      NotebookSpectaPanel,
      INotebookModel
    >
  ) {
    super(options);
  }

  dispose(): void {
    this.content.dispose();
    super.dispose();
  }

  get sessionContext(): ISessionContext | undefined {
    return this.options.content.sessionContext;
  }
}

export class NotebookSpectaPanel extends Widget {
  constructor(
    context: DocumentRegistry.IContext<INotebookModel>,
    spectaWidgetFactory: SpectaWidgetFactory
  ) {
    super();
    this.addClass('jp-specta-notebook-panel');
    context.ready.then(async () => {
      const spectaWidget = await spectaWidgetFactory.createNew({
        context
      });

      if (spectaWidget) {
        this._widget = spectaWidget;
        Widget.attach(this._widget, this.node);
      }
    });
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._widget?.dispose();
    Signal.clearData(this);
    super.dispose();
  }

  get sessionContext(): ISessionContext | undefined {
    return this._widget?.model.context?.sessionContext;
  }

  get model(): INotebookModel | undefined {
    return this._widget?.model.context?.model;
  }

  private _widget: AppWidget | undefined;
}
