import React, { useState } from 'react';
import { useWattWise } from '../context/WattWiseContext.tsx';

export const MeterLogScreen: React.FC = () => {
  const {
    meterReading,
    updateMeterReading,
    registeredUnits,
    baselineKwh,
    discrepancy,
    currentBillResult,
  } = useWattWise();

  const [initialReadingInput, setInitialReadingInput] = useState<number>(meterReading.initialReading);
  const [currentReadingInput, setCurrentReadingInput] = useState<number>(meterReading.currentReading);
  const [cycleDayInput, setCycleDayInput] = useState<number>(meterReading.cycleDay);
  const [saveToast, setSaveToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentReadingInput < initialReadingInput) {
      setError('Current reading cannot be lower than the initial reading.');
      return;
    }
    if (cycleDayInput <= 0 || cycleDayInput > 60) {
      setError('Cycle day must be between 1 and 60 days.');
      return;
    }

    setError(null);
    updateMeterReading({
      initialReading: Number(initialReadingInput),
      currentReading: Number(currentReadingInput),
      cycleDay: Number(cycleDayInput),
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const dailyRunRate = cycleDayInput > 0 ? (registeredUnits / cycleDayInput).toFixed(1) : '0';
  const remainingDays = Math.max(0, meterReading.totalCycleDays - cycleDayInput);
  const remainingBudgetTo500 = Math.max(0, 500 - registeredUnits);
  const maxSafeDailyRate = remainingDays > 0 ? (remainingBudgetTo500 / remainingDays).toFixed(1) : '0';

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-[24px]">electric_meter</span>
            <h1 className="font-headline-sm text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
              METER REGISTER & OPTICAL LOG
            </h1>
          </div>
          <p className="font-body-md text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Synchronize physical TANGEDCO meter registers with digital load telemetry.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--color-success)] text-xs font-semibold self-start sm:self-auto shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
          <span className="font-label-sm uppercase">Optical Sync Verified</span>
        </div>
      </div>

      {/* Main KPI Quad */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
          <span className="font-label-sm text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
            Net Registered
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--color-success)]">{registeredUnits}</span>
            <span className="font-label-sm text-xs font-bold text-[var(--color-success)]">kWh</span>
          </div>
          <span className="font-label-sm text-[11px] text-[var(--text-muted)] block mt-1">
            Current - Initial read
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
          <span className="font-label-sm text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
            Daily Run Rate
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)]">{dailyRunRate}</span>
            <span className="font-label-sm text-xs font-bold text-[var(--color-primary)]">kWh/day</span>
          </div>
          <span className="font-label-sm text-[11px] text-[var(--text-muted)] block mt-1">
            Day {meterReading.cycleDay} pace
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
          <span className="font-label-sm text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
            Cliff Buffer
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span
              className={`font-headline-sm text-2xl sm:text-3xl font-extrabold ${
                currentBillResult.bufferUnits > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'
              }`}
            >
              {currentBillResult.bufferUnits > 0 ? `+${currentBillResult.bufferUnits}` : '0'}
            </span>
            <span className="font-label-sm text-xs font-bold text-[var(--color-warning)]">kWh</span>
          </div>
          <span className="font-label-sm text-[11px] text-[var(--text-muted)] block mt-1">
            Safe ceiling: 500 kWh
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
          <span className="font-label-sm text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
            Safe Target Rate
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">{maxSafeDailyRate}</span>
            <span className="font-label-sm text-xs font-bold text-[var(--text-muted)]">kWh/day</span>
          </div>
          <span className="font-label-sm text-[11px] text-[var(--text-muted)] block mt-1">
            Over {remainingDays} days left
          </span>
        </div>
      </div>

      {/* Meter Reading Edit Form */}
      <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] flex flex-col gap-4">
        <h2 className="font-title-md text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-[22px]">edit_note</span>
          <span>Update Physical Meter Digits & Cycle Position</span>
        </h2>

        {error && (
          <div className="p-3 rounded-xl bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] font-body-md text-xs sm:text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {saveToast && (
          <div className="p-3 rounded-xl bg-[var(--color-success-glow)] border border-[var(--color-success)]/30 text-[var(--color-success)] font-body-md text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Meter readings and cycle calculations updated successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="initial-reading-input" className="font-label-sm text-xs uppercase text-[var(--text-muted)] font-semibold mb-1.5 block">
              Initial Reading (Start of Cycle):
            </label>
            <input
              id="initial-reading-input"
              type="number"
              min="0"
              step="1"
              value={initialReadingInput}
              onChange={(e) => setInitialReadingInput(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] font-label-numeric focus:border-[var(--color-primary)] focus:outline-none transition-all"
            />
            <span className="text-[11px] text-[var(--text-dim)] mt-1 block">e.g. 4820 from previous bill</span>
          </div>

          <div>
            <label htmlFor="current-reading-input" className="font-label-sm text-xs uppercase text-[var(--text-muted)] font-semibold mb-1.5 block">
              Current Meter Register:
            </label>
            <input
              id="current-reading-input"
              type="number"
              min="0"
              step="1"
              value={currentReadingInput}
              onChange={(e) => setCurrentReadingInput(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--color-primary)] font-label-numeric font-bold focus:border-[var(--color-primary)] focus:outline-none transition-all"
            />
            <span className="text-[11px] text-[var(--text-dim)] mt-1 block">Optical snapshot or dial read</span>
          </div>

          <div>
            <label htmlFor="cycle-day-input" className="font-label-sm text-xs uppercase text-[var(--text-muted)] font-semibold mb-1.5 block">
              Current Day of Cycle (1 - 60):
            </label>
            <input
              id="cycle-day-input"
              type="number"
              min="1"
              max="60"
              value={cycleDayInput}
              onChange={(e) => setCycleDayInput(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--color-warning)] font-label-numeric font-bold focus:border-[var(--color-primary)] focus:outline-none transition-all"
            />
            <span className="text-[11px] text-[var(--text-dim)] mt-1 block">
              {60 - cycleDayInput} days remaining in cycle
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="self-start py-2.5 px-6 rounded-xl bg-[var(--color-primary)] text-slate-950 font-body-md uppercase tracking-wider font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer flex items-center gap-2 mt-1"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Save Meter Reading</span>
        </button>
      </form>

      {/* Discrepancy Diagnostics Deep-Dive */}
      <section className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-title-md text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-warning)]">analytics</span>
            <span>Telemetry Discrepancy Diagnostics</span>
          </h2>
          <span className="font-label-numeric text-xs font-bold text-[var(--color-warning)]">
            {discrepancy.percentage}% Offset
          </span>
        </div>

        <p className="font-body-md text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          The difference between your rated appliance baseline ({baselineKwh} kWh) and actual meter register ({registeredUnits} kWh) is <strong className="text-[var(--text-main)]">{discrepancy.diffKwh} kWh</strong>. In domestic environments, appliances do not pull 100% rated wattage continuously.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm font-body-md">
          <div className="p-3.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)]">
            <strong className="text-[var(--text-main)] block mb-1 font-semibold">AC Inverter Modulation</strong>
            <span className="text-[var(--text-muted)] leading-relaxed block">
              Once the room reaches setpoint temperature, the inverter compressor throttles down to 300W–400W rather than full 1050W.
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)]">
            <strong className="text-[var(--text-main)] block mb-1 font-semibold">Refrigerator Duty Cycle</strong>
            <span className="text-[var(--text-muted)] leading-relaxed block">
              Frost-free compressors cycle on and off based on door openings, typically active only 40%–50% of each 24-hour day.
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)]">
            <strong className="text-[var(--text-main)] block mb-1 font-semibold">Standby Vampire Drain</strong>
            <span className="text-[var(--text-muted)] leading-relaxed block">
              Smart TVs, Wi-Fi routers, and power bricks draw constant 5W–20W even when turned off at the remote.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
