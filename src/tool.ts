import { JupyterFrontEnd } from '@jupyterlab/application';
import { IEditorServices } from '@jupyterlab/codeeditor';
import {
  INotebookTracker,
  NotebookModelFactory,
  NotebookPanel
} from '@jupyterlab/notebook';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { SpectaWidgetFactory } from './specta_widget_factory';
import { NotebookGridWidgetFactory } from './document/factory';

export function registerDocumentFactory(options: {
  factoryName: string;
  app: JupyterFrontEnd;
  rendermime: IRenderMimeRegistry;
  tracker: INotebookTracker;
  editorServices: IEditorServices;
  contentFactory: NotebookPanel.IContentFactory;
  spectaTracker: WidgetTracker;
}) {
  const {
    factoryName,
    app,
    rendermime,
    tracker,
    editorServices,
    contentFactory,
    spectaTracker
  } = options;
  const spectaWidgetFactory = new SpectaWidgetFactory({
    manager: app.serviceManager,
    rendermime,
    tracker,
    contentFactory,
    mimeTypeService: editorServices.mimeTypeService,
    editorServices
  });
  const widgetFactory = new NotebookGridWidgetFactory({
    name: factoryName,
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
      spectaTracker.save(widget);
    });
    spectaTracker.add(widget);
  });
}
