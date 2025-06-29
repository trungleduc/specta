import { spectaConfig } from './config_plugin';
import { spectaDocument, spectaOpener } from './document/plugin';
import { spectaLayoutRegistry } from './layout';
import { metadataForm } from './metadata';
import { topbarPlugin } from './topbar';

export * from './tool';
export * from './token';

export default [
  spectaDocument,
  spectaOpener,
  spectaLayoutRegistry,
  topbarPlugin,
  metadataForm,
  spectaConfig
];
