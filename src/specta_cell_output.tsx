import * as nbformat from '@jupyterlab/nbformat';
import { ReactWidget } from '@jupyterlab/ui-components';
import { Panel, Widget } from '@lumino/widgets';
import React from 'react';

import { RandomSkeleton } from './components/cellSkeleton';

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
    if (info.cellModel?.cell_type === 'code') {
      this._placeholder = ReactWidget.create(<RandomSkeleton />);
      this._placeholder.addClass('specta-cell-placeholder');
      this.addWidget(this._placeholder);
    }
  }
  readonly cellIdentity: string;

  get cellOutput(): Widget {
    return this._cellOutput;
  }

  get info(): ICellInfo {
    return this._info;
  }

  removePlaceholder(): void {
    if (this._placeholder) {
      this._placeholder?.dispose();
    }
  }

  private _info: ICellInfo = {};
  private _cellOutput: Widget;
  private _placeholder?: Widget = undefined;
}
