import { IThemeManager } from '@jupyterlab/apputils';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Panel } from '@lumino/widgets';
import * as React from 'react';

import { SpectaWidgetFactory } from '../specta_widget_factory';
import { ISpectaLayoutRegistry, ISpectaShell } from '../token';
import { isSpectaApp, readSpectaConfig } from '../tool';
import { TopbarElement } from '../topbar/widget';
import { NotebookSpectaDocWidget } from './widget';

interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
  spectaWidgetFactory: SpectaWidgetFactory;
  layoutRegistry?: ISpectaLayoutRegistry;
  themeManager?: IThemeManager;
  shell: ISpectaShell;
  spectaLayoutRegistry: ISpectaLayoutRegistry;
}

export class NotebookGridWidgetFactory extends ABCWidgetFactory<
  NotebookSpectaDocWidget,
  INotebookModel
> {
  constructor(options: IOptions) {
    super(options);
    this._spectaWidgetFactory = options.spectaWidgetFactory;
    this._shell = options.shell;
    this._themeManager = options.themeManager;
    this._layoutRegistry = options.spectaLayoutRegistry;
  }

  protected createNewWidget(
    context: DocumentRegistry.IContext<INotebookModel>
  ): NotebookSpectaDocWidget {
    const content = new Panel();
    content.addClass('jp-specta-notebook-panel');

    context.ready.then(async () => {
      const path = context.contentsModel?.path;
      const spectaConfig = readSpectaConfig({
        nbMetadata: context.model.metadata,
        nbPath: path
      });
      const isSpecta = isSpectaApp();
      if (!spectaConfig.hideTopbar) {
        const topbar = ReactWidget.create(
          <TopbarElement
            config={spectaConfig.topBar}
            themeManager={this._themeManager}
            layoutRegistry={this._layoutRegistry}
          />
        );
        topbar.addClass('specta-topbar-element');
        if (!isSpecta) {
          // Not a specta app, add topbar to document widget
          content.addWidget(topbar);
        } else {
          // Specta app, add topbar to layout
          topbar.id = 'specta-topbar-widget';
          this._shell.add(topbar, 'top', { rank: 100 });
        }
      } else if (isSpecta) {
        this._shell.hideTopBar();
      }

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
  private _shell: ISpectaShell;
  private _themeManager?: IThemeManager;
  private _layoutRegistry: ISpectaLayoutRegistry;
}
