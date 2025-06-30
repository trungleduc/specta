import {
  CodeCell,
  CodeCellModel,
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
import { DocumentRegistry } from '@jupyterlab/docregistry';
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
import { PartialJSONValue, PromiseDelegate } from '@lumino/coreutils';
import { ISessionContext } from '@jupyterlab/apputils';
import { readCellConfig } from './tool';

export const VIEW = 'grid_default';
export class AppModel {
  constructor(private options: AppModel.IOptions) {
    this._notebookModelJson = options.context.model.toJSON();
    this._kernelPreference = {
      shouldStart: true,
      canStart: true,
      shutdownOnDispose: true,
      name: options.context.model.defaultKernelName,
      autoStartDefault: true,
      language: options.context.model.defaultKernelLanguage
    };
    this._manager = options.manager;
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

  get rendermime(): IRenderMimeRegistry {
    return this.options.rendermime;
  }

  get cells(): CellList | undefined {
    return this._context?.model.cells;
  }

  get context(): DocumentRegistry.IContext<INotebookModel> | undefined {
    return this._context;
  }
  get panel(): NotebookPanel | undefined {
    return this._notebookPanel;
  }
  async initialize(): Promise<void> {
    const pd = new PromiseDelegate<void>();
    this._context = await createNotebookContext({
      manager: this._manager,
      kernelPreference: this._kernelPreference
    });
    this._context.model.fromJSON(this._notebookModelJson);

    const connectKernel = () => {
      pd.resolve();

      this._notebookPanel = createNotebookPanel({
        context: this._context!,
        rendermime: this.options.rendermime,
        editorServices: this.options.editorServices
      });

      (this.options.tracker.widgetAdded as any).emit(this._notebookPanel);
    };
    const kernel = this._context.sessionContext.session?.kernel;

    if (kernel) {
      const status = kernel.status;
      if (status !== 'unknown') {
        // Connected to an existing kernel.
        connectKernel();
        return;
      }
    }
    this._context.sessionContext.connectionStatusChanged.connect(
      (_, status) => {
        if (status === 'connected') {
          const kernel = this._context!.sessionContext.session?.kernel;
          if (kernel) {
            connectKernel();
          }
        }
      },
      this
    );

    return pd.promise;
  }

  createCell(cellModel: ICellModel): SpectaCellOutput {
    let item: SpectaCellOutput;
    const cellModelJson = cellModel.toJSON();
    const info = {
      cellModel: cellModelJson
    };
    const cellConfig = readCellConfig(cellModelJson);
    switch (cellModel.type) {
      case 'code': {
        let sourceCell: CodeCell | undefined;
        if (cellConfig.showSource) {
          sourceCell = new CodeCell({
            model: cellModel as CodeCellModel,
            rendermime: this.options.rendermime,
            contentFactory: this.options.contentFactory,
            editorConfig: {
              lineNumbers: false,
              lineWrap: false,
              tabFocusable: false,
              editable: false
            }
          });
          sourceCell.syncEditable = false;
          sourceCell.readOnly = true;
        }
        const outputareamodel = new OutputAreaModel({ trusted: true });
        const out = new SimplifiedOutputArea({
          model: outputareamodel,
          rendermime: this.options.rendermime
        });

        item = new SpectaCellOutput({
          cellIdentity: cellModel.id,
          cell: out,
          sourceCell,
          cellConfig,
          info
        });

        break;
      }
      case 'markdown': {
        const markdownCell = new MarkdownCell({
          model: cellModel as MarkdownCellModel,
          rendermime: this.options.rendermime,
          contentFactory: this.options.contentFactory,
          editorConfig: this.options.editorConfig.markdown
        });
        markdownCell.initializeState();
        markdownCell.inputHidden = false;
        markdownCell.rendered = true;
        Private.removeElements(markdownCell.node, 'jp-Collapser');
        Private.removeElements(markdownCell.node, 'jp-InputPrompt');
        item = new SpectaCellOutput({
          cellIdentity: cellModel.id,
          cell: markdownCell,
          info,
          cellConfig
        });
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
        item = new SpectaCellOutput({
          cellIdentity: cellModel.id,
          cell: rawCell,
          info,
          cellConfig
        });
        break;
      }
    }

    return item;
  }

  async executeCell(
    cell: ICellModel,
    outputWrapper: SpectaCellOutput
  ): Promise<IExecuteReplyMsg | undefined> {
    if (cell.type !== 'code' || !this._context) {
      return;
    }
    const output = outputWrapper.cellOutput as SimplifiedOutputArea;
    const source = cell.sharedModel.source;
    const rep = await SimplifiedOutputArea.execute(
      source,
      output,
      this._context.sessionContext
    );
    output.future.done.then(() => {
      outputWrapper.removePlaceholder();
    });
    return rep;
  }

  private _notebookPanel?: NotebookPanel;
  private _context?: DocumentRegistry.IContext<INotebookModel>;
  private _notebookModelJson: PartialJSONValue;
  private _isDisposed = false;
  private _manager: ServiceManager.IManager;
  private _kernelPreference: ISessionContext.IKernelPreference;
}

export namespace AppModel {
  export interface IOptions {
    context: DocumentRegistry.IContext<INotebookModel>;
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
    for (let i = 0; i < elements.length; i++) {
      elements[i].remove();
    }
  }
}
