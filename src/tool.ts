import { JupyterFrontEnd } from '@jupyterlab/application';
import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { ICell, INotebookMetadata } from '@jupyterlab/nbformat';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { Contents } from '@jupyterlab/services';

import { NotebookGridWidgetFactory } from './document/factory';
import { SpectaWidgetFactory } from './specta_widget_factory';
import {
  ISpectaAppConfig,
  ISpectaCellConfig,
  ISpectaLayoutRegistry,
  ISpectaShell
} from './token';

export function registerDocumentFactory(options: {
  factoryName: string;
  app: JupyterFrontEnd<ISpectaShell>;
  rendermime: IRenderMimeRegistry;
  tracker: INotebookTracker;
  editorServices: IEditorServices;
  contentFactory: NotebookPanel.IContentFactory;
  spectaTracker: WidgetTracker;
  spectaLayoutRegistry: ISpectaLayoutRegistry;
  themeManager?: IThemeManager;
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
    themeManager
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
    fileTypes: ['notebook'],
    shell: app.shell,
    spectaWidgetFactory,
    themeManager,
    spectaLayoutRegistry
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

export function createFileBrowser(options: {
  defaultBrowser: IDefaultFileBrowser;
}) {
  const { defaultBrowser } = options;
  const browser = defaultBrowser as any;
  browser.singleClickNavigation = true;
  browser.showFileCheckboxes = false;
  browser.showLastModifiedColumn = false;
  browser.addClass('specta-file-browser');

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

  const oldHandler = browser.listing.handleOpen.bind(browser.listing);
  browser.listing.handleOpen = (item: Contents.IModel) => {
    if (item.type === 'directory') {
      oldHandler(item);
      return;
    } else {
      window.open(urlFactory(item.path), '_blank');
    }
  };

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

export function readSpectaConfig({
  nbMetadata,
  nbPath
}: {
  nbMetadata?: INotebookMetadata;
  nbPath?: string | null;
}): ISpectaAppConfig {
  let rawConfig = PageConfig.getOption('spectaConfig');
  if (!rawConfig || rawConfig.length === 0) {
    rawConfig = '{}';
  }

  const { perFileConfig, ...globalConfig } = JSON.parse(rawConfig);
  let spectaConfig: ISpectaAppConfig = { ...(globalConfig ?? {}) };
  if (perFileConfig && nbPath && perFileConfig[nbPath]) {
    spectaConfig = { ...spectaConfig, ...perFileConfig[nbPath] };
  }
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
