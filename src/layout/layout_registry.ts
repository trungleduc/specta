import { ISignal, Signal } from '@lumino/signaling';
import { ISpectaLayout, ISpectaLayoutRegistry } from '../token';
import { DefaultLayout } from './default';
import { ArticleLayout } from './article';
import { SlidesLayout } from './slides';

export class SpectaLayoutRegistry implements ISpectaLayoutRegistry {
  constructor() {
    const defaultLayout = new DefaultLayout();
    this._registry = new Map<string, ISpectaLayout>();
    this._registry.set('default', defaultLayout);
    this._registry.set('article', new ArticleLayout());
    this._registry.set('slides', new SlidesLayout());
    this._selectedLayout = {
      name: 'default',
      layout: defaultLayout
    };
  }
  get layoutAdded(): ISignal<SpectaLayoutRegistry, string> {
    return this._layoutAdded;
  }

  get selectedLayout(): { name: string; layout: ISpectaLayout } {
    return this._selectedLayout;
  }

  get selectedLayoutChanged(): ISignal<
    SpectaLayoutRegistry,
    { name: string; layout: ISpectaLayout; oldLayout?: ISpectaLayout }
  > {
    return this._selectedLayoutChanged;
  }
  get(name: string): ISpectaLayout | undefined {
    return this._registry.get(name);
  }

  getDefaultLayout(): ISpectaLayout {
    return this._registry.get('default')!;
  }

  async setSelectedLayout(name: string): Promise<void> {
    if (!this._registry.has(name)) {
      throw new Error(`Layout with name ${name} does not exist`);
    }
    const oldLayout = this._selectedLayout.layout;
    this._selectedLayout = { name, layout: this._registry.get(name)! };
    this._selectedLayoutChanged.emit({ ...this._selectedLayout, oldLayout });
  }

  register(name: string, layout: ISpectaLayout): void {
    if (this._registry.has(name)) {
      throw new Error(`Layout with name ${name} already exists`);
    }
    this._registry.set(name, layout);
    this._layoutAdded.emit(name);
  }

  allLayouts(): string[] {
    return Array.from(this._registry.keys());
  }

  private _selectedLayout: { name: string; layout: ISpectaLayout };
  private _registry: Map<string, ISpectaLayout> = new Map();
  private _layoutAdded = new Signal<SpectaLayoutRegistry, string>(this);
  private _selectedLayoutChanged = new Signal<
    SpectaLayoutRegistry,
    { name: string; layout: ISpectaLayout; oldLayout?: ISpectaLayout }
  >(this);
}
