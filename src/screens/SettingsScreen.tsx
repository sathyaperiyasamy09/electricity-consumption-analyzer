import React, { useState } from 'react';
import { useWattWise, AppTheme } from '../context/WattWiseContext.tsx';

interface SettingsScreenProps {
  onOpenWelcome: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onOpenWelcome }) => {
  const {
    userName,
    setUserName,
    meterReading,
    updateMeterReading,
    resetToDefaults,
    theme,
    setTheme,
  } = useWattWise();

  const [nameInput, setNameInput] = useState(userName);
  const [consumerNumber, setConsumerNumber] = useState('09-240-014-482');
  const [cycleDaysInput, setCycleDaysInput] = useState(meterReading.totalCycleDays);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      updateMeterReading({ totalCycleDays: Number(cycleDaysInput) });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  const themes: { id: AppTheme; label: string; desc: string; icon: string; previewBg: string; previewText: string }[] = [
    {
      id: 'slate',
      label: 'Executive Slate',
      desc: 'Dark midnight obsidian with electric sky-blue accents. Minimalist and easy on eyes.',
      icon: 'dark_mode',
      previewBg: 'bg-slate-900 border-slate-700',
      previewText: 'text-sky-400',
    },
    {
      id: 'light',
      label: 'Clean Professional Light',
      desc: 'Bright, high-contrast crisp white with royal blue and emerald data cards.',
      icon: 'light_mode',
      previewBg: 'bg-white border-slate-300',
      previewText: 'text-sky-600',
    },
    {
      id: 'cyber',
      label: 'Cyber Matrix HUD',
      desc: 'High-contrast neon green on deep void canvas for authentic telemetry feel.',
      icon: 'terminal',
      previewBg: 'bg-[#001200] border-[#003502]',
      previewText: 'text-[#00f0ff]',
    },
  ];

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-[24px]">tune</span>
          <h1 className="font-headline-sm text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
            SYSTEM SETTINGS & THEME
          </h1>
        </div>
        <p className="font-body-md text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Personalize interface aesthetics, consumer credentials, and TANGEDCO cycle parameters.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-[var(--color-success-glow)] border border-[var(--color-success)]/40 text-[var(--color-success)] font-body-md text-xs sm:text-sm flex items-center gap-2 animate-fade-in font-medium">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Profile configuration saved successfully.</span>
        </div>
      )}

      {/* Visual Theme Picker */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-title-md text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary)]">palette</span>
            <span>Interface Theme & Styling</span>
          </h2>
          <span className="font-label-sm text-xs text-[var(--color-primary)] font-semibold uppercase">
            Active: {theme}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer shadow-sm relative overflow-hidden ${
                  isSelected
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 bg-[var(--card-bg-elevated)]'
                    : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-border-hover)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]">
                      {t.icon}
                    </span>
                    <span className="font-title-md text-sm font-bold text-[var(--text-main)]">
                      {t.label}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px] text-[var(--color-primary)]">
                      check_circle
                    </span>
                  )}
                </div>

                <p className="font-body-md text-xs text-[var(--text-muted)] leading-relaxed">
                  {t.desc}
                </p>

                {/* Swatch Preview Bar */}
                <div className={`w-full h-7 rounded-lg border p-1 flex items-center justify-between px-2 text-[10px] font-bold ${t.previewBg} ${t.previewText}`}>
                  <span>Preview</span>
                  <span>₹1,323</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* User Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] flex flex-col gap-4">
        <h2 className="font-title-md text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-primary)]">person</span>
          <span>Consumer Profile & Connection Identity</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="settings-name-input" className="font-label-sm text-xs uppercase text-[var(--text-muted)] font-semibold mb-1.5 block">
              Consumer / Household Name:
            </label>
            <input
              id="settings-name-input"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] font-body-md focus:border-[var(--color-primary)] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="settings-consumer-num" className="font-label-sm text-xs uppercase text-[var(--text-muted)] font-semibold mb-1.5 block">
              TANGEDCO Service Connection Number:
            </label>
            <input
              id="settings-consumer-num"
              type="text"
              value={consumerNumber}
              onChange={(e) => setConsumerNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--color-primary)] font-label-numeric font-bold focus:border-[var(--color-primary)] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="settings-cycle-length" className="font-label-sm text-xs uppercase text-[var(--text-muted)] font-semibold mb-1.5 block">
              Billing Cycle Length (Days):
            </label>
            <input
              id="settings-cycle-length"
              type="number"
              min="30"
              max="90"
              value={cycleDaysInput}
              onChange={(e) => setCycleDaysInput(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] font-label-numeric focus:border-[var(--color-primary)] focus:outline-none transition-all"
            />
            <span className="text-[11px] text-[var(--text-dim)] mt-1 block">Tamil Nadu standard is 60 days</span>
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-[var(--color-primary)] text-slate-950 font-body-md uppercase tracking-wider font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer self-start"
            >
              Save Profile
            </button>
          </div>
        </div>
      </form>

      {/* Quick Launch & Reset Tools */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] flex flex-col gap-4">
        <h2 className="font-title-md text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-warning)]">build</span>
          <span>System Maintenance & Data Management</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onOpenWelcome}
            className="py-2.5 px-4 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] hover:border-[var(--color-primary)] text-[var(--color-primary)] font-body-md text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">help</span>
            <span>Re-open Welcome Onboarding</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all appliance inventory and meter records back to the default benchmark?')) {
                resetToDefaults();
              }
            }}
            className="py-2.5 px-4 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--color-danger)]/40 hover:bg-[var(--color-danger-glow)] text-[var(--color-danger)] font-body-md text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">restore</span>
            <span>Reset to Benchmark Sample Data</span>
          </button>
        </div>
      </section>

      {/* Architecture Spec Info */}
      <footer className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-body-md text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <span>WattWise Telemetry Engine • TANGEDCO Domestic LT-1A Compliant</span>
        <span className="font-label-sm text-[10px] text-[var(--color-primary)] font-bold">SYS.V2 ACTIVE</span>
      </footer>
    </div>
  );
};
