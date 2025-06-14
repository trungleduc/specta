import { IThemeManager } from '@jupyterlab/apputils';
import React, { useState, useRef, useEffect } from 'react';

import { Kernel } from '@jupyterlab/services';
// import { ProgressCircle } from './kernelStatus';

export interface ITopbarConfig {
  background?: string;
  textColor?: string;
  title?: string;
  icon?: string;
  kernelActivity?: boolean;
  themeToggle?: boolean;
}
interface IProps {
  config?: ITopbarConfig;
  themeManager: IThemeManager;
  kernelConnection?: Kernel.IKernelConnection;
}

export function TopbarElement(props: IProps): JSX.Element {
  const config = React.useMemo((): ITopbarConfig => {
    if (props.config) {
      return props.config;
    }
    return {
      background: 'var(--jp-layout-color2)',
      title: 'Specta',
      themeToggle: true,
      kernelActivity: true,
      textColor: 'var(--jp-ui-font-color1)'
    };
  }, [props.config]);
  const [themeOptions, setThemeOptions] = useState<string[]>([
    ...props.themeManager.themes
  ]);
  const [kernelBusy, setkernelBusy] = useState<0 | 100>(100);
  React.useEffect(() => {
    const cb = (sender: IThemeManager, args: any) => {
      if (args.newValue.length > 0) {
        return;
      }
      setThemeOptions([...props.themeManager.themes]);
    };
    props.themeManager.themeChanged.connect(cb);
    const kernelCb = (sender: any, status: any) => {
      const progress = status === 'busy' ? 0 : 100;
      setkernelBusy(progress);
    };
    if (props.kernelConnection) {
      props.kernelConnection.statusChanged.connect(kernelCb);
    }

    return () => {
      props.themeManager.themeChanged.disconnect(cb);
      if (props.kernelConnection) {
        props.kernelConnection.statusChanged.disconnect(kernelCb);
      }
    };
  }, [props.themeManager, props.kernelConnection]);

  const onThemeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const theme = e.currentTarget?.value;
      if (theme) {
        props.themeManager.setTheme(theme);
      }
    },
    [props.themeManager]
  );

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeSelect = React.useMemo(() => {
    return (
      <select
        className="specta-topbar-theme"
        onChange={onThemeChange}
        style={{ color: config.textColor ?? 'var(--jp-ui-font-color1)' }}
      >
        {themeOptions.map(el => {
          return (
            <option
              key={el}
              value={el}
              style={{
                background: config.background ?? 'var(--jp-layout-color2)'
              }}
            >
              {el}
            </option>
          );
        })}
      </select>
    );
  }, [themeOptions, onThemeChange, config.textColor, config.background]);
  return (
    <div
      className="specta-topbar"
      style={{ background: config.background ?? 'var(--jp-layout-color2)' }}
    >
      <div className="specta-topbar-left">
        <div>
          {config.icon && <img style={{ width: '50px' }} src={config.icon} />}
        </div>
        <div
          className="specta-topbar-title"
          style={{ color: config.textColor ?? 'var(--jp-ui-font-color1)' }}
        >
          {config.title}
        </div>
      </div>
      <div className="specta-topbar-right">
        {themeSelect}
        <button
          ref={buttonRef}
          className="specta-config-button"
          onClick={() => setOpen(!open)}
        >
          ⚙️
        </button>

        {open && (
          <div ref={dialogRef} className="specta-config-dialog">
            <div className="specta-config-arrow" />
            <div>Config Option 1</div>
            <div>Config Option 2</div>
          </div>
        )}
      </div>
    </div>
  );
}
