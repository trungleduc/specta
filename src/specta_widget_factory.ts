import {
  IEditorMimeTypeService,
  IEditorServices
} from '@jupyterlab/codeeditor';
import {
  INotebookTracker,
  NotebookPanel,
  StaticNotebook
} from '@jupyterlab/notebook';
import * as nbformat from '@jupyterlab/nbformat';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ServiceManager } from '@jupyterlab/services';
import { AppModel } from './specta_model';
import { AppWidget } from './specta_widget';
import { UUID } from '@lumino/coreutils';

export class SpectaWidgetFactory {
  constructor(options: SpectaWidgetFactory.IOptions) {
    this._options = options;
  }

  async createNew(options: {
    content: nbformat.INotebookContent;
  }): Promise<AppWidget> {
    const { content } = options;

    const model = new AppModel({
      notebook: content,
      manager: this._options.manager,
      rendermime: this._options.rendermime,
      tracker: this._options.tracker,
      contentFactory: this._options.contentFactory,
      mimeTypeService: this._options.mimeTypeService,
      editorConfig: StaticNotebook.defaultEditorConfig,
      notebookConfig: StaticNotebook.defaultNotebookConfig,
      editorServices: this._options.editorServices
    });

    const panel = new AppWidget({
      id: UUID.uuid4(),
      label: '',
      model
    });

    return panel;
  }
  private _options: SpectaWidgetFactory.IOptions;
}

export namespace SpectaWidgetFactory {
  export interface IOptions {
    manager: ServiceManager.IManager;
    rendermime: IRenderMimeRegistry;
    tracker: INotebookTracker;
    contentFactory: NotebookPanel.IContentFactory;
    mimeTypeService: IEditorMimeTypeService;
    editorServices: IEditorServices;
  }
}
