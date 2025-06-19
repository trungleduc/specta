import React, { forwardRef } from 'react';

export const IconButton = forwardRef<
  HTMLButtonElement,
  {
    icon: JSX.Element;
    onClick: () => void;
    title?: string;
    disabled?: boolean;
    className?: string;
  }
>(({ icon, onClick, title, disabled, className }, ref) => {
  return (
    <button
      ref={ref}
      className={`jp-Button specta-icon-button ${className ?? ''}`}
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </button>
  );
});
