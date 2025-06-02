import { Widget } from '@lumino/widgets';
import { SpectaCellOutput } from '../specta_cell_output';
import * as nbformat from '@jupyterlab/nbformat';
import { ISpectaLayout } from '../token';

export class DefaultLayout implements ISpectaLayout {
  render(options: {
    host: Widget;
    items: { output: SpectaCellOutput; notebook: nbformat.INotebookContent };
  }): void {
    const { host, items } = options;
    console.log(host, items);
  }
}
