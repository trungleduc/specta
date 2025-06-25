import { IThemeManager } from '@jupyterlab/apputils';
import React, { useState, useRef, useEffect } from 'react';

import { GearIcon } from '../components/icon/gear';
import { IconButton } from '../components/iconButton';
import { SettingContent } from './settingDialog';
import { ISpectaLayoutRegistry, ITopbarConfig } from '../token';

interface IProps {
  config?: ITopbarConfig;
  themeManager?: IThemeManager;
  layoutRegistry?: ISpectaLayoutRegistry;
}

export function TopbarElement(props: IProps): JSX.Element {
  const config = React.useMemo((): ITopbarConfig => {
    return {
      background: props.config?.background ?? 'var(--jp-layout-color2)',
      title: props.config?.title ?? 'Specta',
      themeToggle: Boolean(props.config?.themeToggle),
      kernelActivity: Boolean(props.config?.kernelActivity),
      textColor: props.config?.textColor ?? 'var(--jp-ui-font-color1)'
    };
  }, [props.config]);

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
        <IconButton
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          icon={
            <GearIcon fill="var(--jp-ui-font-color2)" height={24} width={24} />
          }
        />

        {open && (
          <div
            ref={dialogRef}
            className="jp-Dialog-content specta-config-dialog"
          >
            <div className="specta-config-arrow" />
            <SettingContent
              themeManager={props.themeManager}
              layoutRegistry={props.layoutRegistry}
            />
          </div>
        )}
      </div>
    </div>
  );
}
