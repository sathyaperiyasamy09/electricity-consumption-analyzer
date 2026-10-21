import React, { useState } from 'react';
import { useWattWise } from '../context/WattWiseContext.tsx';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { userName, setUserName, setHasCompletedWelcome } = useWattWise();
  const [inputName, setInputName] = useState(userName || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleStart = (nameToSave?: string) => {
    const finalName = (nameToSave !== undefined ? nameToSave : inputName).trim();
    if (!finalName) {
      setError('Please provide your name or household nickname to continue.');
      return;
    }
    setUserName(finalName);
    setHasCompletedWelcome(true);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex items-center justify-center text-[var(--color-primary)] shadow-md shrink-0">
            <span className="material-symbols-outlined text-[26px]">bolt</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 id="welcome-title" className="font-headline-md text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
                WATTWISE
              </h1>
              <span className="font-label-sm text-[10px] uppercase px-2 py-0.5 rounded-full bg-[var(--card-bg-elevated)] text-[var(--color-primary)] border border-[var(--card-border)] font-bold">
                PRO v2.0
              </span>
            </div>
            <p className="font-body-md text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              High-Precision Electricity Telemetry & Tariff Analyzer
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 text-xs font-body-md">
          <div className="p-3.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex items-start gap-2.5 shadow-sm">
            <span className="material-symbols-outlined text-[var(--color-success)] text-[18px] shrink-0 mt-0.5">
              electric_bolt
            </span>
            <div>
              <strong className="text-[var(--text-main)] block font-semibold">Appliance Telemetry</strong>
              <span className="text-[var(--text-muted)]">Auto-calculate device kWh & aggregate load.</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex items-start gap-2.5 shadow-sm">
            <span className="material-symbols-outlined text-[var(--color-warning)] text-[18px] shrink-0 mt-0.5">
              warning_amber
            </span>
            <div>
              <strong className="text-[var(--text-main)] block font-semibold">500-Unit Cliff Monitor</strong>
              <span className="text-[var(--text-muted)]">Protect your TN LT-1A slab concessions.</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex items-start gap-2.5 shadow-sm">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-[18px] shrink-0 mt-0.5">
              insights
            </span>
            <div>
              <strong className="text-[var(--text-main)] block font-semibold">Tariff Simulator</strong>
              <span className="text-[var(--text-muted)]">Simulate usage reductions & instant ₹ savings.</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex items-start gap-2.5 shadow-sm">
            <span className="material-symbols-outlined text-[var(--color-indigo)] text-[18px] shrink-0 mt-0.5">
              rule
            </span>
            <div>
              <strong className="text-[var(--text-main)] block font-semibold">Meter Discrepancy</strong>
              <span className="text-[var(--text-muted)]">Identify standby vampire power & offsets.</span>
            </div>
          </div>
        </div>

        {/* Name Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStart();
          }}
          className="flex flex-col gap-3 relative z-10"
        >
          <label htmlFor="user-name-input" className="font-label-sm uppercase tracking-wider text-[var(--text-muted)] text-xs font-semibold">
            Enter your name or household profile:
          </label>
          <div className="relative">
            <input
              id="user-name-input"
              type="text"
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Karthik, Chennai Household"
              className="w-full px-4 py-3 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--color-primary)] font-body-md transition-all shadow-sm"
              autoFocus
            />
          </div>

          {error && (
            <p className="font-label-sm text-xs text-[var(--color-danger)] flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[15px]">error</span>
              <span>{error}</span>
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-xl bg-[var(--color-primary)] text-slate-950 font-body-md uppercase tracking-wider font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md cursor-pointer"
            >
              <span>Initialize Dashboard</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => handleStart('Karthik (Demo Profile)')}
              className="py-3 px-4 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-body-md text-xs uppercase font-semibold tracking-wider transition-all cursor-pointer"
            >
              Load Demo Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
