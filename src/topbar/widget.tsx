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
      background: props.config?.background ?? 'var(--jp-layout-color1)',
      title: props.config?.title ?? 'Specta',
      themeToggle: Boolean(props.config?.themeToggle),
      kernelActivity: Boolean(props.config?.kernelActivity),
      textColor: props.config?.textColor ?? 'var(--jp-ui-font-color1)',
      icon: props.config?.icon
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
      style={{ background: config.background ?? 'var(--jp-layout-color1)' }}
    >
      <div className="specta-topbar-left">
        <div className="specta-topbar-icon-container">
          {config.icon && <img style={{ height: '100%' }} src={config.icon} />}
        </div>
        <div
          className="specta-topbar-title"
          style={{ color: config.textColor ?? 'var(--jp-ui-font-color1)' }}
        >
          {config.title}
        </div>
      </div>
      {(props.config?.settingsButton !== undefined
        ? props.config.settingsButton
        : true) && (
        <div className="specta-topbar-right">
          <IconButton
            ref={buttonRef}
            onClick={() => setOpen(!open)}
            icon={
              <GearIcon
                fill="var(--jp-ui-font-color2)"
                height={23}
                width={23}
              />
            }
          />

          {open && (
            <div
              ref={dialogRef}
              className="jp-Dialog-content specta-config-dialog"
            >
              <div className="specta-config-arrow" />
              <SettingContent
                config={props.config}
                themeManager={props.themeManager}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
