import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IThemeManager } from '@jupyterlab/apputils';
import { ReactWidget } from '@jupyterlab/ui-components';
import { TopbarElement } from './widget';
import * as React from 'react';
import { isSpectaApp, readSpectaConfig } from '../tool';
import { ISpectaLayoutRegistry, ISpectaShell } from '../token';
import { PathExt } from '@jupyterlab/coreutils';

export const topbarPlugin: JupyterFrontEndPlugin<void, ISpectaShell> = {
  id: 'specta:topbar',
  description: 'Specta topbar extension',
  autoStart: true,
  requires: [IThemeManager, ISpectaLayoutRegistry],
  activate: (
    app: JupyterFrontEnd<ISpectaShell>,
    themeManager: IThemeManager,
    layoutRegistry: ISpectaLayoutRegistry
  ) => {
    const isSpecta = isSpectaApp();
    if (!isSpecta) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');
    if (path && PathExt.extname(path) === '.ipynb') {
      // Specta document will handle the top bar.
      return;
    }
    const config = readSpectaConfig({ nbPath: path });
    if (config.hideTopbar) {
      app.shell.hideTopBar();
      return;
    }
    const widget = ReactWidget.create(
      <TopbarElement
        config={config.topBar}
        themeManager={themeManager}
        layoutRegistry={layoutRegistry}
      />
    );
    widget.id = 'specta-topbar-widget';
    widget.addClass('specta-topbar-element');

    app.shell.add(widget, 'top');
    if (widget.parent) {
      widget.parent.node.style.boxShadow =
        'rgba(0 0 0 / 20%) 0 2px 4px -1px, rgba(0 0 0 / 14%) 0 4px 5px 0, rgba(0 0 0 / 12%) 0 1px 10px 0';
    }
  }
};
