import '@voila-dashboards/voila/lib/sharedscope';
import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import {
  activePlugins,
  createModule,
  loadComponent
} from '@voila-dashboards/voila';

export async function main() {
  const mods = [
    // @jupyterlab plugins
    require('@jupyterlab/markedparser-extension'),
    require('@jupyterlab/markdownviewer-extension'),
    require('@jupyterlab/mathjax-extension'),
    require('@jupyterlab/rendermime-extension'),
    require('@jupyterlab/theme-light-extension'),
    require('@jupyterlab/theme-dark-extension'),
    require('@jupyter-widgets/jupyterlab-manager/lib/plugin').default.filter(
      (p: any) => p.id !== '@jupyter-widgets/jupyterlab-manager:plugin'
    )
  ];

  const mimeExtensions = [
    require('@jupyterlite/iframe-extension'),
    require('@jupyterlab/json-extension'),
    require('@jupyterlab/javascript-extension'),
    require('@jupyterlab/vega5-extension')
  ];

  const extensionData = JSON.parse(
    PageConfig.getOption('federated_extensions')
  );

  const federatedExtensionPromises: any[] = [];
  const federatedMimeExtensionPromises: any[] = [];
  const federatedStylePromises: any[] = [];
  const liteExtensionPromises: any[] = [];

  const extensions = await Promise.allSettled(
    extensionData.map(async (data: any) => {
      await loadComponent(
        `${URLExt.join(
          PageConfig.getOption('fullLabextensionsUrl'),
          data.name,
          data.load
        )}`,
        data.name
      );
      return data;
    })
  );

  Object.entries(extensions).forEach(([_, p]) => {
    if (p.status === 'rejected') {
      // There was an error loading the component
      console.error(p.reason);
      return;
    }

    const data = p.value;
    if (data.liteExtension) {
      liteExtensionPromises.push(createModule(data.name, data.extension));
      return;
    }
    if (data.extension) {
      federatedExtensionPromises.push(createModule(data.name, data.extension));
    }
    if (data.mimeExtension) {
      federatedMimeExtensionPromises.push(
        createModule(data.name, data.mimeExtension)
      );
    }
    if (data.style) {
      federatedStylePromises.push(createModule(data.name, data.style));
    }
  });

  // Add the federated extensions.
  const federatedExtensions = await Promise.allSettled(
    federatedExtensionPromises
  );
  federatedExtensions.forEach(p => {
    if (p.status === 'fulfilled') {
      for (const plugin of activePlugins(p.value, [])) {
        mods.push(plugin);
      }
    } else {
      console.error(p.reason);
    }
  });

  // Add the federated mime extensions.
  const federatedMimeExtensions = await Promise.allSettled(
    federatedMimeExtensionPromises
  );
  federatedMimeExtensions.forEach(p => {
    if (p.status === 'fulfilled') {
      for (const plugin of activePlugins(p.value, [])) {
        mimeExtensions.push(plugin);
      }
    } else {
      console.error(p.reason);
    }
  });

  // Load all federated component styles and log errors for any that do not
  (await Promise.allSettled(federatedStylePromises))
    .filter(({ status }) => status === 'rejected')
    .forEach(p => {
      console.error((p as PromiseRejectedResult).reason);
    });

  const litePluginsToRegister: any[] = [];

  // Add the serverlite federated extensions.
  const federatedLiteExtensions = await Promise.allSettled(
    liteExtensionPromises
  );
  federatedLiteExtensions.forEach(p => {
    if (p.status === 'fulfilled') {
      for (const plugin of activePlugins(p.value, [])) {
        litePluginsToRegister.push(plugin);
      }
    } else {
      console.error(p.reason);
    }
  });

  console.log('DONE');
}
