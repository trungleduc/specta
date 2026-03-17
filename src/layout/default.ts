import { Panel, Widget } from '@lumino/widgets';
import { SpectaCellOutput } from '../specta_cell_output';
import * as nbformat from '@jupyterlab/nbformat';
import { ISpectaLayout } from '../token';
import { SimplifiedOutputArea } from '@jupyterlab/outputarea';
import { MessageLoop } from '@lumino/messaging';

export class DefaultLayout implements ISpectaLayout {
  async render(options: {
    host: Panel;
    items: SpectaCellOutput[];
    notebook: nbformat.INotebookContent;
    readyCallback: () => Promise<void>;
  }): Promise<void> {
    const { host, items, readyCallback } = options;
    for (const el of items) {
      const cellModel = el.info.cellModel;
      const info = el.info;
      if (cellModel?.cell_type === 'code') {
        if (!info.hidden) {
          host.addWidget(el);
        }
      } else {
        if (!info.hidden) {
          host.addWidget(el);
        }
      }
    }
    await readyCallback();
  }

  async export(options: {
    items: SpectaCellOutput[];
    notebook: nbformat.INotebookContent;
    readyCallback: () => Promise<void>;
  }): Promise<string> {
    await options.readyCallback();
    const parent = new Widget();
    const host = new Panel();
    MessageLoop.sendMessage(host, Widget.Msg.BeforeAttach);
    parent.node.insertBefore(host.node, null);
    MessageLoop.sendMessage(host, Widget.Msg.AfterAttach);
    host.addClass('specta-output-host');
    for (const el of options.items) {
      const cellModel = el.info.cellModel;
      const info = el.info;

      if (cellModel?.cell_type === 'code') {
        if (!info.hidden) {
          host.addWidget(el);
          const output = el.cellOutput as SimplifiedOutputArea;
          await output.future.done;
          const allModels = output.model.toJSON();
          for (let index = 0; index < allModels.length; index++) {
            const model = allModels[index];
            if (
              model.output_type === 'display_data' &&
              (model.data as any)?.['application/vnd.jupyter.widget-view+json']
            ) {
              const modelData = (model.data as any)?.[
                'application/vnd.jupyter.widget-view+json'
              ];
              console.log('display_data', modelData);
              const outputWidgets = output.widgets[index];
              for (const element of outputWidgets.children()) {
                if (
                  (element as any)?.mimeType ===
                  'application/vnd.jupyter.widget-view+json'
                ) {
                  const manager = await (element as any)._manager.promise;
                  console.log(
                    'correspndiong elke',
                    element,
                    manager,
                    manager.get_state_sync()
                  );
                }
              }
            }
          }

          el.removePlaceholder();
        }
      } else {
        console.log('not-output', el.node.innerHTML);

        if (!info.hidden) {
          host.addWidget(el);
        }
      }
    }
    // sleep for 2 second
    await new Promise(resolve => setTimeout(resolve, 2000));
    return host.node.innerHTML;
  }
}
