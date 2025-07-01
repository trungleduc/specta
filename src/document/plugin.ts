import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IWidgetTracker, WidgetTracker } from '@jupyterlab/apputils';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { PathExt } from '@jupyterlab/coreutils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IKernelSpecManager } from '@jupyterlab/services';
import { Widget } from '@lumino/widgets';

import { ISpectaDocTracker, ISpectaLayoutRegistry } from '../token';
import {
  createFileBrowser,
  hideAppLoadingIndicator,
  isSpectaApp,
  registerDocumentFactory
} from '../tool';

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
  requires: [
    IDocumentManager,
    IDefaultFileBrowser,
    ISpectaDocTracker,
    IKernelSpecManager
  ],
  activate: async (
    app: JupyterFrontEnd,
    docManager: IDocumentManager,
    defaultBrowser: IDefaultFileBrowser
  ): Promise<void> => {
    if (!isSpectaApp()) {
      // Not a specta app, return
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');

    if (!path) {
      const browser = createFileBrowser({ defaultBrowser });
      app.shell.add(browser, 'main', { rank: 100 });
      hideAppLoadingIndicator();
    } else {
      if (PathExt.extname(path) === '.ipynb') {
        app.shell.addClass('specta-document-viewer');
        const widget = docManager.openOrReveal(path, 'specta');
        if (widget) {
          app.shell.add(widget, 'main');
        }
      } else {
        let count = 0;
        const tryOpen = () => {
          const widget = docManager.openOrReveal(path);
          if (widget) {
            app.shell.add(widget, 'main');
            hideAppLoadingIndicator();
          } else {
            count++;
            if (count > 10) {
              console.error('Failed to open file', path);
              //TODO Open in text editor?
              return;
            }
            setTimeout(tryOpen, 100);
          }
        };
        tryOpen();
      }
    }
  }
};
