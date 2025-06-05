import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';

import { ISpectaDocTracker, spectaDocument } from './document/plugin';
import { ISpectaLayoutRegistry } from './token';
import { createFileBrowser, hideAppLoadingIndicator } from './tool';
import { SpectaLayoutRegistry } from './layout/layout_registry';

const spectaOpener: JupyterFrontEndPlugin<void> = {
  id: 'specta/application-extension:opener',
  autoStart: true,
  requires: [IDocumentManager, ISpectaDocTracker],
  activate: async (
    app: JupyterFrontEnd,
    docManager: IDocumentManager
  ): Promise<void> => {
    const meta = document.querySelector('meta[name="specta-config"]');

    if (!meta) {
      // Not a specta app, return
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');
    if (!path) {
      const browser = createFileBrowser({ docManager });
      app.shell.add(browser, 'main', { rank: 100 });
      hideAppLoadingIndicator();
    } else {
      const widget = docManager.openOrReveal(path, 'specta');
      if (widget) {
        app.shell.add(widget, 'main');
      }
    }
  }
};

const spectaLayoutRegistry: JupyterFrontEndPlugin<ISpectaLayoutRegistry> = {
  id: 'specta:layout-registry',
  autoStart: true,
  provides: ISpectaLayoutRegistry,
  activate: (app: JupyterFrontEnd): ISpectaLayoutRegistry => {
    const layoutRegistry = new SpectaLayoutRegistry();

    return layoutRegistry;
  }
};

export default [spectaDocument, spectaOpener, spectaLayoutRegistry];
