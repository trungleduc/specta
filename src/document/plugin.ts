import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IWidgetTracker, WidgetTracker } from '@jupyterlab/apputils';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { Token } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';

import { registerDocumentFactory } from '../tool';

export const ISpectaDocTracker = new Token<IWidgetTracker<Widget>>(
  'exampleDocTracker'
);
const activate = (
  app: JupyterFrontEnd,
  rendermime: IRenderMimeRegistry,
  tracker: INotebookTracker,
  editorServices: IEditorServices,
  contentFactory: NotebookPanel.IContentFactory
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
    spectaTracker
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
    NotebookPanel.IContentFactory
  ],
  activate,
  provides: ISpectaDocTracker
};
