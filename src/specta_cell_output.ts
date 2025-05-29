import { Panel, Widget } from '@lumino/widgets';
export class SpectaCellOutput extends Panel {
  constructor(cellIdentity: string, cell: Widget, info?: any) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('specta-cell-output');
    const content = new Panel();
    content.addClass('specta-cell-content');
    cell.addClass('specta-item-widget');
    content.addWidget(cell);
    this.addWidget(content);
    this._cellOutput = cell;
    this.cellIdentity = cellIdentity;
    this._info = info ?? {};
  }
  readonly cellIdentity: string;

  get cellOutput(): Widget {
    return this._cellOutput;
  }

  get info(): any {
    return this._info;
  }

  private _info: any = {};
  private _cellOutput: Widget;
}
