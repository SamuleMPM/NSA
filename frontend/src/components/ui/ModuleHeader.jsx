import React from 'react';

export default function ModuleHeader({
  code,
  kicker = 'FLIGHT OPERATIONS',
  title,
  description,
  icon: Icon,
  status,
  actions,
  className = '',
}) {
  return (
    <header className={`panel overflow-hidden ${className}`}>
      <div className="relative flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-4 xl:flex-row xl:items-center xl:justify-between">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-48 opacity-60"
          style={{
            background:
              'linear-gradient(90deg, rgba(11, 61, 145, 0.08), transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex min-w-0 items-start gap-3.5">
          {Icon ? (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#C9D9F5] bg-[#DBEAFE] text-[#0B3D91] shadow-co-sm">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {code ? (
                <span className="pill pill-cyan">{code}</span>
              ) : null}
              <span className="eyebrow">{kicker}</span>
            </div>
            <h1 className="font-heading text-[19px] font-extrabold leading-tight tracking-tight text-[#0B3D91] sm:text-[23px]">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-[#000000]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {(status || actions) && (
          <div className="relative flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
            {status}
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
