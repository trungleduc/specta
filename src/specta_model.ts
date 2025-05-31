import {
  ICellModel,
  MarkdownCell,
  MarkdownCellModel,
  RawCell,
  RawCellModel
} from '@jupyterlab/cells';
import {
  IEditorMimeTypeService,
  IEditorServices
} from '@jupyterlab/codeeditor';
import { Context } from '@jupyterlab/docregistry';
import * as nbformat from '@jupyterlab/nbformat';
import {
  CellList,
  INotebookModel,
  INotebookTracker,
  NotebookPanel,
  StaticNotebook
} from '@jupyterlab/notebook';
import { OutputAreaModel, SimplifiedOutputArea } from '@jupyterlab/outputarea';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ServiceManager } from '@jupyterlab/services';
import { IExecuteReplyMsg } from '@jupyterlab/services/lib/kernel/messages';

import {
  createNotebookContext,
  createNotebookPanel
} from './create_notebook_panel';
import { SpectaCellOutput } from './specta_cell_output';

export const VIEW = 'grid_default';
export class AppModel {
  constructor(private options: AppModel.IOptions) {
    this._notebook = options.notebook;
  }
  /**
   * Whether the handler is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._context?.dispose();
    this._notebookPanel?.dispose();
  }
  get notebook(): nbformat.INotebookContent {
    return this._notebook;
  }

  get rendermime(): IRenderMimeRegistry {
    return this.options.rendermime;
  }

  get cells(): CellList | undefined {
    return this._context?.model.cells;
  }

  get context(): Context<INotebookModel> | undefined {
    return this._context;
  }
  get panel(): NotebookPanel | undefined {
    return this._notebookPanel;
  }
  public async initialize(): Promise<void> {
    this._context = await createNotebookContext({
      manager: this.options.manager
    });
    this._context.model.fromJSON(this.options.notebook);
    this._notebookPanel = createNotebookPanel({
      context: this._context,
      rendermime: this.options.rendermime,
      editorServices: this.options.editorServices
    });

    (this.options.tracker.widgetAdded as any).emit(this._notebookPanel);
  }

  createCell(cellModel: ICellModel): SpectaCellOutput {
    let item: SpectaCellOutput;
    const cellModelJson = cellModel.toJSON();
    const info = {
      cellModel: cellModelJson
    };
    switch (cellModel.type) {
      case 'code': {
        const outputareamodel = new OutputAreaModel({ trusted: true });
        const out = new SimplifiedOutputArea({
          model: outputareamodel,
          rendermime: this.options.rendermime
        });
        item = new SpectaCellOutput(cellModel.id, out, info);
        break;
      }
      case 'markdown': {
        const markdownCell = new MarkdownCell({
          model: cellModel as MarkdownCellModel,
          rendermime: this.options.rendermime,
          contentFactory: this.options.contentFactory,
          editorConfig: this.options.editorConfig.markdown
        });
        console.log(markdownCell, cellModel.toJSON());
        markdownCell.inputHidden = false;
        markdownCell.rendered = true;
        Private.removeElements(markdownCell.node, 'jp-Collapser');
        Private.removeElements(markdownCell.node, 'jp-InputPrompt');
        item = new SpectaCellOutput(cellModel.id, markdownCell, info);
        break;
      }
      default: {
        const rawCell = new RawCell({
          model: cellModel as RawCellModel,
          contentFactory: this.options.contentFactory,
          editorConfig: this.options.editorConfig.raw
        });
        rawCell.inputHidden = false;
        Private.removeElements(rawCell.node, 'jp-Collapser');
        Private.removeElements(rawCell.node, 'jp-InputPrompt');
        item = new SpectaCellOutput(cellModel.id, rawCell, info);
        break;
      }
    }

    return item;
  }

  async executeCell(
    cell: ICellModel,
    output: SimplifiedOutputArea
  ): Promise<IExecuteReplyMsg | undefined> {
    if (cell.type !== 'code' || !this._context) {
      return;
    }
    const source = cell.sharedModel.source;
    const rep = await SimplifiedOutputArea.execute(
      source,
      output,
      this._context.sessionContext
    );
    return rep;
  }

  private _notebook: nbformat.INotebookContent;
  private _notebookPanel?: NotebookPanel;
  private _context?: Context<INotebookModel>;
  private _isDisposed = false;
}

export namespace AppModel {
  export interface IOptions {
    notebook: nbformat.INotebookContent;
    manager: ServiceManager.IManager;
    rendermime: IRenderMimeRegistry;
    tracker: INotebookTracker;
    contentFactory: NotebookPanel.IContentFactory;
    mimeTypeService: IEditorMimeTypeService;
    editorConfig: StaticNotebook.IEditorConfig;
    notebookConfig: StaticNotebook.INotebookConfig;
    editorServices: IEditorServices;
  }
}

namespace Private {
  /**
   * Remove children by className from an HTMLElement.
   */
  export function removeElements(node: HTMLElement, className: string): void {
    const elements = node.getElementsByClassName(className);
    console.log('removing', node, className, elements);
    for (let i = 0; i < elements.length; i++) {
      elements[i].remove();
    }
  }
}
