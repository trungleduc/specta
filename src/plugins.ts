import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { ISettingRegistry } from '@jupyterlab/settingregistry';

const opener: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlite/application-extension:opener',
  autoStart: true,
  requires: [IDocumentManager],
  optional: [ILabShell, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    docManager: IDocumentManager,
    labShell: ILabShell | null,
    settingRegistry: ISettingRegistry | null
  ): Promise<void> => {
    const { serviceManager } = app;
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');
    if (!path) {
      return;
    }
    const sessionManager = serviceManager.sessions;

    const connection = await sessionManager.startNew({
      // TODO Get these name and path information from the exporter
      name: '',
      path: '',
      type: 'notebook',
      kernel: {
        name: 'xpython'
      }
    });
    const kernel = connection.kernel;
    if (!kernel) {
      console.error('Can not start kernel');
      return;
    }

    const content = await serviceManager.contents.get(path, {
      content: true
    });
    console.log(content, kernel);

    kernel.connectionStatusChanged.connect(async (_, status) => {
      if (status === 'connected') {
        if (!connection.kernel) {
          return;
        }

        kernel.statusChanged.connect(async (kernelConnection, status) => {
          if (status === 'idle') {
            console.log('Kernel is idle');
          }
        });
      }
    });
  }
};

export default [opener];
