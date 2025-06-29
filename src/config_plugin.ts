import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { PageConfig } from '@jupyterlab/coreutils';
import { ISpectaAppConfig } from './token';

export const spectaConfig: JupyterFrontEndPlugin<ISpectaAppConfig> = {
  id: 'specta:app-config',
  autoStart: true,
  provides: ISpectaAppConfig,
  activate: (app: JupyterFrontEnd): ISpectaAppConfig => {
    let rawConfig = PageConfig.getOption('spectaConfig');
    if (!rawConfig || rawConfig.length === 0) {
      rawConfig = '{}';
    }
    const spectaConfig = JSON.parse(rawConfig) as ISpectaAppConfig;

    return spectaConfig;
  }
};
