import { Panel, Widget } from '@lumino/widgets';
import { SpectaCellOutput } from '../specta_cell_output';
import * as nbformat from '@jupyterlab/nbformat';
import { ISpectaLayout } from '../token';
import Reveal from 'reveal.js';

class HostPanel extends Panel {
  constructor() {
    super();
    this.addClass('specta-slides-host-widget');
    this.addClass('reveal');
    this._outputs = new Panel();
    this._outputs.addClass('slides');
    this.addWidget(this._outputs);
  }

  addOutput(widget: Widget): void {
    const section = document.createElement('section');
    const sectionWidget = new Widget({ node: section });
    sectionWidget.node.appendChild(widget.node);
    widget.parent = sectionWidget;
    sectionWidget.processMessage = msg => {
      widget.processMessage(msg);
    };
    this._outputs.addWidget(sectionWidget);
  }
  private _outputs: Panel;
}
export class SlidesLayout implements ISpectaLayout {
  async render(options: {
    host: Panel;
    items: SpectaCellOutput[];
    notebook: nbformat.INotebookContent;
    readyCallback: () => Promise<void>;
  }): Promise<void> {
    const { host, items, readyCallback } = options;
    const hostPanel = new HostPanel();
    for (const el of items) {
      const info = el.info;
      if (!info.hidden) {
        hostPanel.addOutput(el);
      }
    }
    host.addWidget(hostPanel);
    await readyCallback();

    const deck = new Reveal(hostPanel.node, {
      embedded: true
    });
    deck.initialize();
    deck.on('slidetransitionend', event => {
      window.dispatchEvent(new Event('resize'));
    });

    this._deckMap.set(host.node, deck);
  }
  async unload(node: HTMLElement): Promise<void> {
    console.log('deck is ', this._deckMap.get(node));
    console.log('aaa');
  }

  private _deckMap = new WeakMap<HTMLElement, Reveal.Api>();
}
