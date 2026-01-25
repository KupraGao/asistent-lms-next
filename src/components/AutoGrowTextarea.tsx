"use client";

import * as React from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
};

export default function AutoGrowTextarea({
  minRows = 3,
  className = "",
  onInput,
  ...props
}: Props) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  const resize = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // reset -> measure -> set
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // start with minimum height based on rows
    el.rows = minRows;
    resize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      className={`resize-none overflow-hidden ${className}`}
      onInput={(e) => {
        resize();
        onInput?.(e);
      }}
      {...props}
    />
  );
}
