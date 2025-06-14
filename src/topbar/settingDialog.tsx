import { IThemeManager } from '@jupyterlab/apputils';
import React, { useState, useEffect, useCallback } from 'react';

export const SettingContent = (props: { themeManager: IThemeManager }) => {
  const { themeManager } = props;
  const [themeOptions, setThemeOptions] = useState<string[]>([
    ...themeManager.themes
  ]);
  const [selectedTheme, setSelectedTheme] = useState<string>(
    themeManager.theme ?? 'light'
  );
  useEffect(() => {
    const cb = (sender: IThemeManager, args: any) => {
      if (args.newValue.length > 0) {
        return;
      }
      setThemeOptions([...themeManager.themes]);
      if (themeManager.theme) {
        setSelectedTheme(themeManager.theme);
      }
    };
    themeManager.themeChanged.connect(cb);

    return () => {
      themeManager.themeChanged.disconnect(cb);
    };
  }, [themeManager]);

  const onThemeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const theme = e.currentTarget?.value;
      if (theme) {
        themeManager.setTheme(theme);
        setSelectedTheme(theme);
      }
    },
    [themeManager]
  );

  return (
    <div>
      <div>
        <label htmlFor="">Select theme</label>
        <div className="jp-select-wrapper">
          <select
            className=" jp-mod-styled specta-topbar-theme"
            onChange={onThemeChange}
            value={selectedTheme}
          >
            {themeOptions.map(el => {
              return (
                <option
                  key={el}
                  value={el}
                  style={{
                    background: 'var(--jp-layout-color2)'
                  }}
                >
                  {el}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
};
