import React from 'react';

export default function Panel({
  as: Tag = 'section',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag className={`panel ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function PanelHeader({
  icon: Icon,
  kicker,
  title,
  description,
  status,
  actions,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col gap-3 border-b border-[#C9D9F5] sm:flex-row sm:items-center sm:justify-between ${
        compact ? 'px-3 py-2.5' : 'px-4 py-3'
      } ${className}`}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon ? (
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#C9D9F5] bg-[#DBEAFE] text-[#0B3D91]">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          {kicker ? <span className="eyebrow block">{kicker}</span> : null}
          <h3 className="truncate font-heading text-[13px] font-bold tracking-tight text-[#0B3D91]">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#000000]">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {(status || actions) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {status}
          {actions}
        </div>
      )}
    </div>
  );
}
