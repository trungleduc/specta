import React from 'react';
export namespace ProgressCircle {
  /**
   * Props for the ProgressBar.
   */
  export interface IProps {
    /**
     * The current progress percentage, from 0 to 100
     */
    progress: number;
    /**
     * The aria-label for the widget
     */
    label?: string;
    /**
     * Element width
     */
    width?: number;
    /**
     * Element height
     */
    height?: number;
    /**
     * Color ò the stroke
     */
    stroke?: string;
  }
}

export function ProgressCircle(props: ProgressCircle.IProps): JSX.Element {
  const radius = 104;
  const d = (progress: number): string => {
    const angle = Math.max(progress * 3.6, 0.1);
    const rad = (angle * Math.PI) / 180,
      x = Math.sin(rad) * radius,
      y = Math.cos(rad) * -radius,
      mid = angle < 180 ? 1 : 0,
      shape =
        `M 0 0 v -${radius} A ${radius} ${radius} 1 ` +
        mid +
        ' 0 ' +
        x.toFixed(4) +
        ' ' +
        y.toFixed(4) +
        ' z';
    return shape;
  };
  return (
    <div
      className={'jp-Statusbar-ProgressCircle'}
      role="progressbar"
      aria-label={props.label || 'Unlabelled progress circle'}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={props.progress}
      style={{ margin: 'auto' }}
    >
      <svg viewBox="0 0 250 250">
        <circle
          cx="125"
          cy="125"
          r={`${radius}`}
          strokeWidth="20"
          fill="none"
          stroke={props.stroke ?? 'var(--jp-inverse-layout-color2)'}
        />
        <path
          transform="translate(125,125) scale(.9)"
          d={d(props.progress)}
          fill={props.stroke ?? 'var(--jp-inverse-layout-color2)'}
        />
      </svg>
    </div>
  );
}
