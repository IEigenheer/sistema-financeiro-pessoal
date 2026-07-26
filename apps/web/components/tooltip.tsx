'use client';

import { useState, ReactNode } from 'react';

type Props = {
  content: string;
  children: ReactNode;
};

export function Tooltip({ content, children }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="tooltip-trigger">{children}</span>
      {visible && <span className="tooltip-content">{content}</span>}
    </span>
  );
}
