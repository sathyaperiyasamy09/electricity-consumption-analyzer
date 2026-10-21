import React from 'react';
import { useWattWise, ActiveTab } from '../context/WattWiseContext.tsx';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'telemetry', label: 'Telemetry', icon: 'query_stats' },
  { id: 'devices', label: 'Devices', icon: 'precision_manufacturing' },
  { id: 'meter-log', label: 'Meter Log', icon: 'electric_meter' },
  { id: 'tariff', label: 'Tariff', icon: 'calculate' },
  { id: 'simulation', label: 'Simulation', icon: 'insights' },
  { id: 'settings', label: 'Settings', icon: 'tune' },
];

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useWattWise();

  return (
    <nav
      className="fixed bottom-0 w-full z-40 bg-[var(--canvas-bg-glass)] backdrop-blur-xl border-t border-[var(--card-border)] shadow-md transition-colors duration-200"
      aria-label="Application Navigation"
    >
      <div className="max-w-5xl mx-auto h-16 px-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[64px] min-h-[44px] gap-1 transition-all cursor-pointer relative py-1 rounded-xl ${
                isActive
                  ? 'text-[var(--color-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-bg-elevated)]/50'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-[var(--color-primary)] shadow-sm" />
              )}
              <span className={`material-symbols-outlined text-[20px] sm:text-[22px] transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className="font-label-sm text-[10px] sm:text-[11px] font-medium tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
