import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { Widget } from '@lumino/widgets';

import { registerDocumentFactory } from './tool';

const opener: JupyterFrontEndPlugin<void> = {
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
    docManager: IDocumentManager,
    rendermime: IRenderMimeRegistry,
    tracker: INotebookTracker,
    editorServices: IEditorServices,
    contentFactory: NotebookPanel.IContentFactory
  ): Promise<void> => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');
    if (!path) {
      return;
    }
    const namespace = 'specta-standalone';
    const spectaTracker = new WidgetTracker<Widget>({ namespace });

    registerDocumentFactory({
      factoryName: 'specta-standalone',
      app,
      rendermime,
      tracker,
      editorServices,
      contentFactory,
      spectaTracker
    });

    const widget = docManager.openOrReveal(path, 'specta-standalone');
    if (widget) {
      app.shell.add(widget, 'main');
      return;
    }
  }
};

export default [opener];
