import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { IEditorServices } from '@jupyterlab/codeeditor';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IKernelSpecs } from '@jupyterlite/kernel';
import { SpectaWidgetFactory } from './specta_widget_factory';
const opener: JupyterFrontEndPlugin<void> = {
  id: 'specta/application-extension:opener',
  autoStart: true,
  requires: [
    IKernelSpecs,
    IRenderMimeRegistry,
    INotebookTracker,
    IEditorServices,
    NotebookPanel.IContentFactory
  ],
  optional: [ILabShell, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    kernelSpecs: IKernelSpecs,
    rendermime: IRenderMimeRegistry,
    tracker: INotebookTracker,
    editorServices: IEditorServices,
    contentFactory: NotebookPanel.IContentFactory,
    labShell: ILabShell | null,
    settingRegistry: ISettingRegistry | null
  ): Promise<void> => {
    const { serviceManager } = app;
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');
    if (!path) {
      return;
    }
    await serviceManager.ready;
    const sessionManager = serviceManager.sessions;
    await sessionManager.ready;

    const content = await serviceManager.contents.get(path, {
      content: true
    });
    const notebook = content.content;

    const notebookGridFactory = new SpectaWidgetFactory({
      manager: app.serviceManager,
      rendermime,
      tracker,
      contentFactory,
      mimeTypeService: editorServices.mimeTypeService,
      editorServices
    });

    const spectaPanel = await notebookGridFactory.createNew({
      content: notebook
    });
    app.shell.add(spectaPanel, 'main');
  }
};

export default [opener];
