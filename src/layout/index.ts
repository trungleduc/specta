import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { SpectaLayoutRegistry } from './layout_registry';
import { ISpectaLayoutRegistry } from '../token';
import { readSpectaConfig } from '../tool';

export const spectaLayoutRegistry: JupyterFrontEndPlugin<ISpectaLayoutRegistry> =
  {
    id: 'specta:layout-registry',
    autoStart: true,
    provides: ISpectaLayoutRegistry,
    activate: (app: JupyterFrontEnd): ISpectaLayoutRegistry => {
      const layoutRegistry = new SpectaLayoutRegistry();
      const spectaConfig = readSpectaConfig();
      const defaultLayout = spectaConfig.defaultLayout ?? 'default';
      layoutRegistry.setSelectedLayout(defaultLayout);
      return layoutRegistry;
    }
  };
