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
  getDefaultLayout(): ISpectaLayout;
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

export interface ITopbarConfig {
  background?: string;
  textColor?: string;
  title?: string;
  icon?: string;
  kernelActivity?: boolean;
  themeToggle?: boolean;
}

export interface ISpectaAppConfig {
  topBar?: ITopbarConfig;
  defaultLayout?: string;
  hideTopbar?: boolean;
}

export interface ISpectaCellConfig {
  showSource?: boolean;
  showOutput?: boolean;
}
export const ISpectaLayoutRegistry = new Token<ISpectaLayoutRegistry>(
  'specta:ISpectaLayoutRegistry'
);

export const ISpectaDocTracker = new Token<IWidgetTracker<Widget>>(
  'exampleDocTracker'
);
