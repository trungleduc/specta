import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IWidgetTracker, WidgetTracker } from '@jupyterlab/apputils';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { Widget } from '@lumino/widgets';
import { IDocumentManager } from '@jupyterlab/docmanager';

import {
  createFileBrowser,
  hideAppLoadingIndicator,
  isSpectaApp,
  registerDocumentFactory
} from '../tool';
import { ISpectaDocTracker, ISpectaLayoutRegistry } from '../token';
import { IKernelSpecManager } from '@jupyterlab/services';

const activate = (
  app: JupyterFrontEnd,
  rendermime: IRenderMimeRegistry,
  tracker: INotebookTracker,
  editorServices: IEditorServices,
  contentFactory: NotebookPanel.IContentFactory,
  spectaLayoutRegistry: ISpectaLayoutRegistry
): IWidgetTracker => {
  const namespace = 'specta';
  const spectaTracker = new WidgetTracker<Widget>({ namespace });

  registerDocumentFactory({
    factoryName: 'specta',
    app,
    rendermime,
    tracker,
    editorServices,
    contentFactory,
    spectaTracker,
    spectaLayoutRegistry
  });

  return spectaTracker;
};

export const spectaDocument: JupyterFrontEndPlugin<IWidgetTracker> = {
  id: 'specta:notebook-doc',
  autoStart: true,
  requires: [
    IRenderMimeRegistry,
    INotebookTracker,
    IEditorServices,
    NotebookPanel.IContentFactory,
    ISpectaLayoutRegistry
  ],
  activate,
  provides: ISpectaDocTracker
};

export const spectaOpener: JupyterFrontEndPlugin<void> = {
  id: 'specta/application-extension:opener',
  autoStart: true,
  requires: [IDocumentManager, ISpectaDocTracker, IKernelSpecManager],
  activate: async (
    app: JupyterFrontEnd,
    docManager: IDocumentManager
  ): Promise<void> => {
    if (!isSpectaApp()) {
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
