import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';

import { NotebookSpectaPanel, NotebookSpectaDocWidget } from './widget';

import { INotebookModel } from '@jupyterlab/notebook';
import { SpectaWidgetFactory } from '../specta_widget_factory';

interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
  spectaWidgetFactory: SpectaWidgetFactory;
}

export class NotebookGridWidgetFactory extends ABCWidgetFactory<
  NotebookSpectaDocWidget,
  INotebookModel
> {
  constructor(options: IOptions) {
    super(options);
    this._spectaWidgetFactory = options.spectaWidgetFactory;
  }

  protected createNewWidget(
    context: DocumentRegistry.IContext<INotebookModel>
  ): NotebookSpectaDocWidget {
    // const content = new Widget();

    const widget = new NotebookSpectaDocWidget({
      context,
      content: new NotebookSpectaPanel(context, this._spectaWidgetFactory)
    });

    return widget;
  }

  private _spectaWidgetFactory: SpectaWidgetFactory;
}
