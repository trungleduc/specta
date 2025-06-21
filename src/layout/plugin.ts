import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { SpectaLayoutRegistry } from './layout_registry';
import { ISpectaAppConfig, ISpectaLayoutRegistry } from '../token';
import { PageConfig } from '@jupyterlab/coreutils';

export const spectaLayoutRegistry: JupyterFrontEndPlugin<ISpectaLayoutRegistry> =
  {
    id: 'specta:layout-registry',
    autoStart: true,
    provides: ISpectaLayoutRegistry,
    activate: (app: JupyterFrontEnd): ISpectaLayoutRegistry => {
      const layoutRegistry = new SpectaLayoutRegistry();
      const spectaConfig = JSON.parse(
        PageConfig.getOption('spectaConfig') ?? '{}'
      ) as ISpectaAppConfig;
      const defaultLayout = spectaConfig.layout ?? 'default';
      layoutRegistry.setSelectedLayout(defaultLayout);
      return layoutRegistry;
    }
  };
