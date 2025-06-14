import { spectaDocument, spectaOpener } from './document/plugin';
import { spectaLayoutRegistry } from './layout/plugin';
import { topbarPlugin } from './topbar/plugin';

export * from './tool';
export * from './token';

export default [
  spectaDocument,
  spectaOpener,
  spectaLayoutRegistry,
  topbarPlugin
];
