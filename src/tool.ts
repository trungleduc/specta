import { JupyterFrontEnd } from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { FilterFileBrowserModel } from '@jupyterlab/filebrowser';
import {
  INotebookTracker,
  NotebookPanel,
  NotebookModelFactory
} from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { VoilaFileBrowser } from '@voila-dashboards/voila';

import { NotebookGridWidgetFactory } from './document/factory';
import { SpectaWidgetFactory } from './specta_widget_factory';
import { IDocumentManager } from '@jupyterlab/docmanager';
import {
  ISpectaAppConfig,
  ISpectaCellConfig,
  ISpectaLayoutRegistry
} from './token';
import { INotebookMetadata } from '@jupyterlab/nbformat';
import { ICell } from '@jupyterlab/nbformat';
export function registerDocumentFactory(options: {
  factoryName: string;
  app: JupyterFrontEnd;
  rendermime: IRenderMimeRegistry;
  tracker: INotebookTracker;
  editorServices: IEditorServices;
  contentFactory: NotebookPanel.IContentFactory;
  spectaTracker: WidgetTracker;
  spectaLayoutRegistry: ISpectaLayoutRegistry;
}) {
  const {
    factoryName,
    app,
    rendermime,
    tracker,
    editorServices,
    contentFactory,
    spectaTracker,
    spectaLayoutRegistry
  } = options;

  const spectaWidgetFactory = new SpectaWidgetFactory({
    manager: app.serviceManager,
    rendermime,
    tracker,
    contentFactory,
    mimeTypeService: editorServices.mimeTypeService,
    editorServices,
    spectaLayoutRegistry
  });
  const widgetFactory = new NotebookGridWidgetFactory({
    name: factoryName,
    modelName: 'notebook',
    fileTypes: ['ipynb'],
    spectaWidgetFactory
  });

  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

  // Creating and registering the model factory for our custom DocumentModelAdd commentMore actions
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
    const url = new URL(URLExt.join(baseUrl, appUrl));
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

export function hideAppLoadingIndicator() {
  const indicator = document.getElementById('specta-loader-host');
  const spinner = document.getElementById('specta-loader-spinner');
  if (indicator && spinner) {
    indicator.style.opacity = '0';
    setTimeout(() => {
      spinner.remove();
      indicator.remove();
      document.body.classList.remove('jp-mod-dark', 'jp-mod-light');
    }, 1000);
  }
}

export function isSpectaApp(): boolean {
  return !!document.querySelector('meta[name="specta-config"]');
}

export function readSpectaConfig(
  nbMetadata?: INotebookMetadata
): ISpectaAppConfig {
  let rawConfig = PageConfig.getOption('spectaConfig');
  if (!rawConfig || rawConfig.length === 0) {
    rawConfig = '{}';
  }
  const spectaConfig = JSON.parse(rawConfig) as ISpectaAppConfig;
  const spectaMetadata = (nbMetadata?.specta ?? {}) as ISpectaAppConfig;

  return { ...spectaConfig, ...spectaMetadata };
}

export function readCellConfig(cell?: ICell): Required<ISpectaCellConfig> {
  const metaData = (cell?.metadata?.specta ?? {}) as any;
  const spectaCellConfig: Required<ISpectaCellConfig> = {
    showSource: false,
    showOutput: true
  };

  if (metaData.showSource && metaData.showSource === 'Yes') {
    spectaCellConfig.showSource = true;
  }

  if (metaData.showOutput && metaData.showOutput === 'No') {
    spectaCellConfig.showOutput = false;
  }

  return spectaCellConfig;
}
