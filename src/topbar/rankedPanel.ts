import { ArrayExt } from '@lumino/algorithm';
import { PanelLayout, Widget } from '@lumino/widgets';

interface IRankItem<T extends Widget = Widget> {
  /**
   * The widget for the item.
   */
  widget: T;

  /**
   * The sort rank of the menu.
   */
  rank: number;
}

function itemCmp(first: IRankItem, second: IRankItem): number {
  return first.rank - second.rank;
}
export class RankedPanel<T extends Widget = Widget> extends Widget {
  constructor() {
    super();
    this.layout = new PanelLayout();
  }

  addWidget(widget: Widget, rank: number): void {
    const rankItem = { widget, rank };
    const index = ArrayExt.upperBound(this._items, rankItem, itemCmp);
    ArrayExt.insert(this._items, index, rankItem);

    const layout = this.layout as PanelLayout;
    layout.insertWidget(index, widget);
  }

  /**
   * Handle the removal of a child
   *
   */
  protected onChildRemoved(msg: Widget.ChildMessage): void {
    const index = ArrayExt.findFirstIndex(
      this._items,
      item => item.widget === msg.child
    );
    if (index !== -1) {
      ArrayExt.removeAt(this._items, index);
    }
  }

  private _items: IRankItem<T>[] = [];
}
