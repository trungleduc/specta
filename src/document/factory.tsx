import { IThemeManager } from '@jupyterlab/apputils';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import * as React from 'react';

import { SpectaWidgetFactory } from '../specta_widget_factory';
import { ISpectaLayoutRegistry } from '../token';
import { isSpectaApp, readSpectaConfig } from '../tool';
import { TopbarElement } from '../topbar/widget';
import { NotebookSpectaDocWidget } from './widget';

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
    const spectaConfig = readSpectaConfig(context.model.metadata);
    if (!isSpectaApp() && !spectaConfig.hideTopbar) {
      // Not a specta app, add topbar to document widget
      const topbar = ReactWidget.create(<TopbarElement />);
      content.addWidget(topbar);
    }

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
