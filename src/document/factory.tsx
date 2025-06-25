import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';

import { NotebookSpectaDocWidget } from './widget';

import { INotebookModel } from '@jupyterlab/notebook';
import { SpectaWidgetFactory } from '../specta_widget_factory';
import { Panel } from '@lumino/widgets';
import { ReactWidget } from '@jupyterlab/ui-components';
import { TopbarElement } from '../topbar/widget';
import * as React from 'react';
import { ISpectaLayoutRegistry } from '../token';
import { IThemeManager } from '@jupyterlab/apputils';

interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
  spectaWidgetFactory: SpectaWidgetFactory;
  layoutRegistry?: ISpectaLayoutRegistry;
  themeManager?: IThemeManager;
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
    const content = new Panel();
    content.addClass('jp-specta-notebook-panel');
    const topbar = ReactWidget.create(<TopbarElement />);
    content.addWidget(topbar);
    context.ready.then(async () => {
      const spectaWidget = await this._spectaWidgetFactory.createNew({
        context
      });

      if (spectaWidget) {
        content.addWidget(spectaWidget);
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
