import { Token } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import { SpectaCellOutput } from './specta_cell_output';
import * as nbformat from '@jupyterlab/nbformat';
import { ISignal } from '@lumino/signaling';

export interface ISpectaLayout {
  render(options: {
    host: Widget;
    items: { output: SpectaCellOutput; notebook: nbformat.INotebookContent };
  }): void;
}
export interface ISpectaLayoutRegistry {
  get(name: string): ISpectaLayout | undefined;
  register(name: string, layout: ISpectaLayout): void;
  allLayouts(): string[];
  layoutAdded: ISignal<void, string>;
  selectedLayout: { name: string; layout: ISpectaLayout };
  setSelectedLayout(name: string): void;
  selectedLayoutChanged: ISignal<void, { name: string; layout: ISpectaLayout }>;
}
export const ISpectaLayoutRegistry = new Token<ISpectaLayoutRegistry>(
  'specta:ISpectaLayoutRegistry'
);
