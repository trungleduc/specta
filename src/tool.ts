import { JupyterFrontEnd } from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { FilterFileBrowserModel } from '@jupyterlab/filebrowser';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { VoilaFileBrowser } from '@voila-dashboards/voila';

import { NotebookGridWidgetFactory } from './document/factory';
import { SpectaWidgetFactory } from './specta_widget_factory';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { ISpectaAppConfig, ISpectaLayoutRegistry } from './token';

export const SPECTA_CELL_VISIBLE_TAG = 'specta:visible';
export function registerDocumentFactory(options: {
  factoryName: string;
  app: JupyterFrontEnd;
  rendermime: IRenderMimeRegistry;
  tracker: INotebookTracker;
  editorServices: IEditorServices;
  contentFactory: NotebookPanel.IContentFactory;
  spectaTracker: WidgetTracker;
  spectaLayoutRegistry: ISpectaLayoutRegistry;
  spectaConfig: ISpectaAppConfig;
}) {
  const {
    factoryName,
    app,
    rendermime,
    tracker,
    editorServices,
    contentFactory,
    spectaTracker,
    spectaLayoutRegistry,
    spectaConfig
  } = options;

  const spectaWidgetFactory = new SpectaWidgetFactory({
    manager: app.serviceManager,
    rendermime,
    tracker,
    contentFactory,
    mimeTypeService: editorServices.mimeTypeService,
    editorServices,
    spectaLayoutRegistry,
    spectaConfig
  });
  const widgetFactory = new NotebookGridWidgetFactory({
    name: factoryName,
    modelName: 'notebook',
    fileTypes: ['notebook'],
    spectaWidgetFactory,
    preferKernel: true,
    canStartKernel: true,
    autoStartDefault: true,
    shutdownOnClose: true
  });

  // Registering the widget factory
  app.docRegistry.addWidgetFactory(widgetFactory);

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
