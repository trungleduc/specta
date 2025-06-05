import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { SpectaLayoutRegistry } from './layout_registry';
import { ISpectaLayoutRegistry } from '../token';

export const spectaLayoutRegistry: JupyterFrontEndPlugin<ISpectaLayoutRegistry> =
  {
    id: 'specta:layout-registry',
    autoStart: true,
    provides: ISpectaLayoutRegistry,
    activate: (app: JupyterFrontEnd): ISpectaLayoutRegistry => {
      const layoutRegistry = new SpectaLayoutRegistry();

      return layoutRegistry;
    }
  };
