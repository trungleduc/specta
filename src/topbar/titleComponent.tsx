import React from 'react';

import { ITopbarConfig } from '../token';

interface IProps {
  config?: ITopbarConfig;
}

export function TitleComponent(props: IProps): JSX.Element {
  const config = React.useMemo((): ITopbarConfig => {
    return {
      title: props.config?.title ?? 'Specta',
      textColor: props.config?.textColor ?? 'var(--jp-ui-font-color1)',
      icon: props.config?.icon,
      link: props.config?.link
    };
  }, [props.config]);

  return (
    <>
      <div className="specta-topbar-icon-container">
        {config.icon && <img style={{ height: '100%' }} src={config.icon} />}
      </div>
      <a
        className="specta-topbar-title"
        style={{
          color: config.textColor ?? 'var(--jp-ui-font-color1)',
          cursor: 'pointer'
        }}
        href={config.link}
        target="_blank"
        rel="noopener noreferrer"
        title={config.title}
        aria-label={config.title}
      >
        {config.title}
      </a>
    </>
  );
}
