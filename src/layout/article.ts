import { Panel } from '@lumino/widgets';
import { SpectaCellOutput } from '../specta_cell_output';
import * as nbformat from '@jupyterlab/nbformat';
import { ISpectaLayout } from '../token';

class HostPanel extends Panel {
  constructor() {
    super();
    this.addClass('specta-article-host-panel');
  }
}
export class ArticleLayout implements ISpectaLayout {
  async render(options: {
    host: Panel;
    items: SpectaCellOutput[];
    notebook: nbformat.INotebookContent;
    readyCallback: () => Promise<void>;
  }): Promise<void> {
    const { host, items, readyCallback } = options;
    const hostPanel = new HostPanel();
    for (const el of items) {
      const outputNode = el.cellOutput.node;
      const cellModel = el.info.cellModel;
      const info = el.info;
      if (cellModel?.cell_type === 'code') {
        if (outputNode.childNodes.length > 0) {
          if (!info.hidden) {
            hostPanel.addWidget(el);
          }
        }
      } else {
        if (!info.hidden) {
          hostPanel.addWidget(el);
        }
      }
    }
    host.addWidget(hostPanel);
    await readyCallback();
  }
}
