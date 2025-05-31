import { IEditorServices } from '@jupyterlab/codeeditor';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { INotebookModel, Notebook, NotebookPanel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

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
