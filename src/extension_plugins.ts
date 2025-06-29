import { spectaConfig } from './config_plugin';
import { spectaDocument, spectaOpener } from './document/plugin';
import { spectaLayoutRegistry } from './layout';
import { appMeta, cellMeta } from './metadata';
import { topbarPlugin } from './topbar';

export * from './tool';
export * from './token';

export default [
  spectaDocument,
  spectaOpener,
  spectaLayoutRegistry,
  topbarPlugin,
  appMeta,
  cellMeta,
  spectaConfig
];
