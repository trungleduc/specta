import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

export const cellMeta: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-specta:cell-meta',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    // no-op
  }
};
export const appMeta: JupyterFrontEndPlugin<void> = {
  id: 'jupyter-specta:app-meta',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    // no-op
  }
};
