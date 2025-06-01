import { JupyterFrontEnd } from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { PageConfig } from '@jupyterlab/coreutils';
import { FilterFileBrowserModel } from '@jupyterlab/filebrowser';
import {
  INotebookTracker,
  NotebookModelFactory,
  NotebookPanel
} from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { VoilaFileBrowser } from '@voila-dashboards/voila';

import { NotebookGridWidgetFactory } from './document/factory';
import { SpectaWidgetFactory } from './specta_widget_factory';
import { IDocumentManager } from '@jupyterlab/docmanager';

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

export function createFileBrowser(options: { docManager: IDocumentManager }) {
  const { docManager } = options;

  const model = new FilterFileBrowserModel({
    manager: docManager,
    auto: true
  });
  const urlFactory = (path: string) => {
    const baseUrl = PageConfig.getBaseUrl();
    let appUrl = PageConfig.getOption('appUrl');
    if (!appUrl.endsWith('/')) {
      appUrl = `${appUrl}/`;
    }
    const url = new URL(appUrl, baseUrl);
    url.searchParams.set('path', path);
    const queries = PageConfig.getOption('query').split('&').filter(Boolean);
    queries.forEach(query => {
      const [key, value] = query.split('=');
      url.searchParams.set(key, value);
    });
    return url.toString();
  };
  const browser = new VoilaFileBrowser({
    id: 'filebrowser',
    model,
    restore: false,
    urlFactory,
    title: 'Select items to open with Specta.'
  });
  browser.showFileCheckboxes = false;
  browser.showLastModifiedColumn = false;
  browser.addClass('specta-file-browser');
  return browser;
}
