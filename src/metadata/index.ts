import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization of a simple metadata form plugin.
 */
export const metadataForm: JupyterFrontEndPlugin<void> = {
  id: 'specta/metadata-form:cell-meta',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('Simple metadata-form example activated');
  }
};
