import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';

import { NotebookSpectaDocWidget } from './widget';

import { INotebookModel } from '@jupyterlab/notebook';
import { SpectaWidgetFactory } from '../specta_widget_factory';
import { Widget } from '@lumino/widgets';

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
    const content = new Widget();
    content.addClass('jp-specta-notebook-panel');
    context.ready.then(async () => {
      const spectaWidget = await this._spectaWidgetFactory.createNew({
        context
      });

      if (spectaWidget) {
        Widget.attach(spectaWidget, content.node);
      }
    });

    const widget = new NotebookSpectaDocWidget({
      context,
      content
    });

    return widget;
  }

  private _spectaWidgetFactory: SpectaWidgetFactory;
}
