import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { Signal } from '@lumino/signaling';

import { spectaDocument } from './document/plugin';
import { DefaultLayout } from './layout/default';
import { ISpectaLayout, ISpectaLayoutRegistry } from './token';
import { createFileBrowser, hideAppLoadingIndicator } from './tool';

const spectaOpener: JupyterFrontEndPlugin<void> = {
  id: 'specta/application-extension:opener',
  autoStart: true,
  requires: [IDocumentManager],
  activate: async (
    app: JupyterFrontEnd,
    docManager: IDocumentManager
  ): Promise<void> => {
    const meta = document.querySelector('meta[name="specta-config"]');

    if (!meta) {
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

const spectaLayoutRegistry: JupyterFrontEndPlugin<ISpectaLayoutRegistry> = {
  id: 'specta:layout-registry',
  autoStart: true,
  provides: ISpectaLayoutRegistry,
  activate: (app: JupyterFrontEnd): ISpectaLayoutRegistry => {
    const registry = new Map<string, ISpectaLayout>();
    const layoutAdded = new Signal<any, string>({});

    const layoutRegistry = {
      get(name: string): ISpectaLayout | undefined {
        return registry.get(name);
      },
      register(name: string, layout: ISpectaLayout): void {
        if (registry.has(name)) {
          throw new Error(`Layout with name ${name} already exists`);
        }
        registry.set(name, layout);
        layoutAdded.emit(name);
      },
      allLayouts(): string[] {
        return Array.from(registry.keys());
      },
      layoutAdded: layoutAdded
    };

    return layoutRegistry;
  }
};

const spectaDefaultLayout: JupyterFrontEndPlugin<void> = {
  id: 'specta:default-layout',
  autoStart: true,
  requires: [ISpectaLayoutRegistry],
  activate: (app: JupyterFrontEnd, layoutRegistry: ISpectaLayoutRegistry) => {
    const defaultLayout = new DefaultLayout();
    layoutRegistry.register('default', defaultLayout);
  }
};

export default [
  spectaDocument,
  spectaOpener,
  spectaLayoutRegistry,
  spectaDefaultLayout
];
