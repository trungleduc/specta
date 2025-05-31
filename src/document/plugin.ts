import { WidgetTracker, IWidgetTracker } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { Token } from '@lumino/coreutils';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  NotebookModelFactory,
  INotebookTracker,
  NotebookPanel
} from '@jupyterlab/notebook';
import { NotebookGridWidgetFactory } from './factory';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { SpectaWidgetFactory } from '../specta_widget_factory';

const FACTORY = 'Specta';
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
  const newTracker = new WidgetTracker<Widget>({ namespace });
  const spectaWidgetFactory = new SpectaWidgetFactory({
    manager: app.serviceManager,
    rendermime,
    tracker,
    contentFactory,
    mimeTypeService: editorServices.mimeTypeService,
    editorServices
  });
  const widgetFactory = new NotebookGridWidgetFactory({
    name: FACTORY,
    modelName: 'notebook',
    fileTypes: ['ipynb'],
    spectaWidgetFactory,
    preferKernel: true,
    canStartKernel: true,
    autoStartDefault: true
  });

  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  // Creating and registering the model factory for our custom DocumentModel
  const modelFactory = new NotebookModelFactory({});
  app.docRegistry.addModelFactory(modelFactory);
  // register the filetype
  app.docRegistry.addFileType({
    name: 'ipynb',
    displayName: 'IPYNB',
    mimeTypes: ['text/json'],
    extensions: ['.ipynb', '.IPYNB'],
    fileFormat: 'json',
    contentType: 'notebook'
  });
  widgetFactory.widgetCreated.connect((sender, widget) => {
    widget.context.pathChanged.connect(() => {
      newTracker.save(widget);
    });
    newTracker.add(widget);
  });
  return newTracker;
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
