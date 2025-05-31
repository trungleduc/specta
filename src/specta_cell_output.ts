import { Panel, Widget } from '@lumino/widgets';
import * as nbformat from '@jupyterlab/nbformat';

export interface ICellInfo {
  hidden?: boolean;
  cellModel?: nbformat.ICell;
}
export class SpectaCellOutput extends Panel {
  constructor(cellIdentity: string, cell: Widget, info: ICellInfo) {
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

  get info(): ICellInfo {
    return this._info;
  }

  private _info: ICellInfo = {};
  private _cellOutput: Widget;
}
