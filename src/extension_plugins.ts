import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { spectaDocument } from './document/plugin';
import { createFileBrowser, hideAppLoadingIndicator } from './tool';

const spectaOpener: JupyterFrontEndPlugin<void> = {
  id: 'specta/application-extension:opener',
  autoStart: true,
  requires: [
    IDocumentManager,
    IRenderMimeRegistry,
    INotebookTracker,
    IEditorServices,
    NotebookPanel.IContentFactory
  ],
  optional: [ILabShell, ISettingRegistry],
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

export default [spectaDocument, spectaOpener];
