import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IThemeManager } from '@jupyterlab/apputils';
import { ReactWidget } from '@jupyterlab/ui-components';
import { TopbarElement } from './widget';
import * as React from 'react';
import { isSpectaApp, readSpectaConfig } from '../tool';
import { ISpectaLayoutRegistry } from '../token';

/**
 * Initialization data for the voila_topbar extension.
 */
export const topbarPlugin: JupyterFrontEndPlugin<void> = {
  id: 'specta:topba',
  description: 'Specta topbar extension',
  autoStart: true,
  requires: [IThemeManager, ISpectaLayoutRegistry],
  activate: (
    app: JupyterFrontEnd,
    themeManager: IThemeManager,
    layoutRegistry: ISpectaLayoutRegistry
  ) => {
    const isSpecta = isSpectaApp();
    if (!isSpecta) {
      return;
    }
    const config = readSpectaConfig();
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
