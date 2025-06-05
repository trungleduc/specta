import { Panel } from '@lumino/widgets';
import { SpectaCellOutput } from '../specta_cell_output';
import * as nbformat from '@jupyterlab/nbformat';
import { ISpectaLayout } from '../token';
import { hideAppLoadingIndicator } from '../tool';

export class DefaultLayout implements ISpectaLayout {
  async render(options: {
    host: Panel;
    items: SpectaCellOutput[];
    notebook: nbformat.INotebookContent;
  }): Promise<void> {
    const { host, items } = options;
    for (const el of items) {
      const outputNode = el.cellOutput.node;
      const cellModel = el.info.cellModel;
      const info = el.info;
      if (cellModel?.cell_type === 'code') {
        if (outputNode.childNodes.length > 0) {
          if (!info.hidden) {
            host.addWidget(el);
          }
        }
      } else {
        if (!info.hidden) {
          host.addWidget(el);
        }
      }
    }

    hideAppLoadingIndicator();
  }
}
