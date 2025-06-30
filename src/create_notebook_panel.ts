import { ISessionContext } from '@jupyterlab/apputils';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { Context, DocumentRegistry } from '@jupyterlab/docregistry';
import {
  INotebookModel,
  Notebook,
  NotebookModelFactory,
  NotebookPanel
} from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ServiceManager } from '@jupyterlab/services';
import { UUID } from '@lumino/coreutils';

class CustomContext extends Context<INotebookModel> {
  /**
   * Save the document contents to disk.
   */
  async save(): Promise<void> {
    await this.ready;
    return;
  }

  async saveAs(): Promise<void> {
    await this.ready;
    return;
  }

  async revert(): Promise<void> {
    await this.ready;
    return;
  }
}

export async function createNotebookContext(options: {
  manager: ServiceManager.IManager;
  kernelPreference: ISessionContext.IKernelPreference;
}): Promise<Context<INotebookModel>> {
  const factory = new NotebookModelFactory({
    disableDocumentWideUndoRedo: false
  });
  const { manager, kernelPreference } = options;
  const path = UUID.uuid4() + '.ipynb';

  await manager.ready;
  await manager.kernelspecs.ready;

  const context = new CustomContext({
    manager,
    factory,
    path,
    kernelPreference: kernelPreference
  });

  await context.sessionContext.initialize();
  return context;
}

export function createNotebookPanel(options: {
  context: DocumentRegistry.IContext<INotebookModel>;
  rendermime: IRenderMimeRegistry;
  editorServices: IEditorServices;
}): NotebookPanel {
  const { context, rendermime, editorServices } = options;
  const editorFactory = editorServices.factoryService.newInlineEditor;
  const content = new Notebook({
    rendermime,
    contentFactory: new Notebook.ContentFactory({ editorFactory }),
    mimeTypeService: editorServices.mimeTypeService
  });
  return new NotebookPanel({
    content,
    context
  });
}
