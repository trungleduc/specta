import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { SpectaLayoutRegistry } from './layout_registry';
import { ISpectaAppConfig, ISpectaLayoutRegistry } from '../token';

export const spectaLayoutRegistry: JupyterFrontEndPlugin<ISpectaLayoutRegistry> =
  {
    id: 'specta:layout-registry',
    autoStart: true,
    provides: ISpectaLayoutRegistry,
    requires: [ISpectaAppConfig],
    activate: (
      app: JupyterFrontEnd,
      spectaConfig: ISpectaAppConfig
    ): ISpectaLayoutRegistry => {
      const layoutRegistry = new SpectaLayoutRegistry();

      const defaultLayout = spectaConfig.defaultLayout ?? 'default';
      layoutRegistry.setSelectedLayout(defaultLayout);
      return layoutRegistry;
    }
  };
