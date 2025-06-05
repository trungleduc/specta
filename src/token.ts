import { Token } from '@lumino/coreutils';
import { Panel, Widget } from '@lumino/widgets';
import { SpectaCellOutput } from './specta_cell_output';
import * as nbformat from '@jupyterlab/nbformat';
import { ISignal } from '@lumino/signaling';
import { IWidgetTracker } from '@jupyterlab/apputils';

export interface ISpectaLayout {
  render(options: {
    host: Panel;
    items: SpectaCellOutput[];
    notebook: nbformat.INotebookContent;
    readyCallback: () => Promise<void>;
  }): Promise<void>;
}
export interface ISpectaLayoutRegistry {
  get(name: string): ISpectaLayout | undefined;
  register(name: string, layout: ISpectaLayout): void;
  allLayouts(): string[];
  layoutAdded: ISignal<ISpectaLayoutRegistry, string>;
  selectedLayout: { name: string; layout: ISpectaLayout };
  setSelectedLayout(name: string): void;
  selectedLayoutChanged: ISignal<
    ISpectaLayoutRegistry,
    { name: string; layout: ISpectaLayout }
  >;
}
export const ISpectaLayoutRegistry = new Token<ISpectaLayoutRegistry>(
  'specta:ISpectaLayoutRegistry'
);

export const ISpectaDocTracker = new Token<IWidgetTracker<Widget>>(
  'exampleDocTracker'
);
