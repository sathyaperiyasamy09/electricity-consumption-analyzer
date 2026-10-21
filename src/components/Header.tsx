import React, { useState } from 'react';
import { useWattWise, AppTheme } from '../context/WattWiseContext.tsx';

interface HeaderProps {
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenProfile }) => {
  const { userName, forecastKwh, theme, setTheme } = useWattWise();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = () => {
    setIsSyncing(true);
    setSyncMessage('Polling optical meter & telemetry bus...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('Telemetry synchronized');
      setTimeout(() => setSyncMessage(null), 2500);
    }, 800);
  };

  const isCliffSafe = forecastKwh <= 500;

  const cycleTheme = () => {
    if (theme === 'slate') setTheme('light');
    else if (theme === 'light') setTheme('cyber');
    else setTheme('slate');
  };

  const themeMeta = {
    slate: { label: 'Slate Dark', icon: 'dark_mode' },
    light: { label: 'Clean Light', icon: 'light_mode' },
    cyber: { label: 'Cyber Matrix', icon: 'terminal' },
  }[theme];

  return (
    <header className="fixed top-0 w-full z-50 bg-[var(--canvas-bg-glass)] backdrop-blur-xl border-b border-[var(--card-border)] shadow-sm transition-colors duration-200">
      <div className="max-w-5xl mx-auto h-16 px-4 flex items-center justify-between">
        {/* Brand & Live Connection Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex items-center justify-center text-[var(--color-primary)] shadow-sm">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-main)]">
                WATTWISE
              </span>
              <span className="font-label-sm text-[10px] uppercase px-1.5 py-0.5 rounded-md bg-[var(--card-bg-elevated)] text-[var(--text-muted)] border border-[var(--card-border-subtle)]">
                SYS.V2
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCliffSafe ? 'bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success-glow)]' : 'bg-[var(--color-danger)] shadow-[0_0_8px_var(--color-danger-glow)]'
                } animate-pulse`}
              />
              <span
                className={`font-label-sm text-[10px] uppercase tracking-wider font-semibold ${
                  isCliffSafe ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                }`}
              >
                {isCliffSafe ? 'LIVE TARIFF OPTIMAL' : 'CLIFF ALERT ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {syncMessage && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--color-primary)] font-label-sm text-xs animate-fade-in shadow-sm">
            <span className="material-symbols-outlined text-[14px]">sensors</span>
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Theme Switcher */}
          <button
            onClick={cycleTheme}
            aria-label={`Current theme: ${themeMeta.label}. Click to switch theme.`}
            title={`Switch Theme (Current: ${themeMeta.label})`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--color-primary)] transition-all cursor-pointer shadow-sm text-xs font-medium"
          >
            <span className="material-symbols-outlined text-[18px] text-[var(--color-primary)]">
              {themeMeta.icon}
            </span>
            <span className="hidden md:inline font-label-sm text-[11px]">
              {themeMeta.label}
            </span>
          </button>

          {/* Sync Trigger */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            aria-label="Synchronize telemetry"
            title="Poll meter & sensors"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--color-primary)] transition-all relative cursor-pointer shadow-sm"
          >
            <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin text-[var(--color-primary)]' : ''}`}>
              sync
            </span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
          </button>

          {/* User Profile */}
          <button
            onClick={onOpenProfile}
            aria-label={`User profile: ${userName}`}
            title={`Account: ${userName}`}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--color-primary)] transition-all group cursor-pointer shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--canvas-bg)] font-bold text-xs">
              <span className="material-symbols-outlined text-[15px]">person</span>
            </div>
            <span className="hidden sm:inline font-body-md text-xs font-semibold text-[var(--text-main)]">
              {userName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
