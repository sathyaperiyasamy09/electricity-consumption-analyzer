import React, { useState } from 'react';
import { useWattWise } from '../context/WattWiseContext.tsx';
import { calculateApplianceKwh } from '../utils/tariffCalculations.ts';
import { Rupee, formatCurrency } from '../components/Rupee.tsx';

export const TelemetryDashboard: React.FC = () => {
  const {
    registeredUnits,
    baselineKwh,
    forecastKwh,
    discrepancy,
    currentBillResult,
    meterReading,
    appliances,
    recommendations,
    setActiveTab,
    openEditApplianceModal,
    openAddApplianceModal,
  } = useWattWise();

  const [simButtonFeedback, setSimButtonFeedback] = useState<string | null>(null);

  // Cycle progress calculation
  const cyclePercent = Math.min(100, Math.round((meterReading.cycleDay / meterReading.totalCycleDays) * 100));
  const remainingDays = Math.max(0, meterReading.totalCycleDays - meterReading.cycleDay);
  const bufferRemaining = Math.max(0, 500 - registeredUnits);
  const maxSafeDailyRate = remainingDays > 0 ? (bufferRemaining / remainingDays).toFixed(1) : '0';

  // Position for cliff gauge pin (scale 0 - 600 kWh)
  const pinPercent = Math.min(100, Math.max(0, (registeredUnits / 600) * 100));

  // Category Icon helper
  const getApplianceIcon = (category: string, name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('ac') || category === 'cooling') return 'mode_fan';
    if (lower.includes('fridge') || category === 'refrigeration') return 'kitchen';
    if (lower.includes('fan') || category === 'ventilation') return 'toys';
    if (lower.includes('geyser') || category === 'heating') return 'water_heater';
    if (lower.includes('light') || lower.includes('standby') || category === 'lighting') return 'power';
    if (lower.includes('tv') || category === 'entertainment') return 'tv';
    if (lower.includes('wash') || category === 'kitchen') return 'local_laundry_service';
    return 'bolt';
  };

  const handleSimulateClick = () => {
    setSimButtonFeedback('Running Tariff Model...');
    setTimeout(() => {
      setSimButtonFeedback('Buffer Secured: +61 kWh Max');
      setTimeout(() => {
        setSimButtonFeedback(null);
        setActiveTab('simulation');
      }, 700);
    }, 600);
  };

  const primaryRecommendation = recommendations[0] || {
    title: 'AC Thermostat Optimization',
    description: 'Raising thermostat setpoint from 20°C to 24°C saves approximately 46 kWh across the final 18 days, preventing the cliff jump and preserving tariff concessions.',
  };

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4 max-w-5xl mx-auto pb-24">
      {/* Executive Billing & Connection Status Banner */}
      <section className="flex flex-col gap-4 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] relative overflow-hidden transition-colors duration-200">
        <div className="flex items-center justify-between relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--color-success)] text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span className="font-label-sm uppercase tracking-wider">
              TN DOMESTIC LT-1A
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-muted)] font-label-sm text-xs">
            <span className="material-symbols-outlined text-[15px] text-[var(--color-primary)]">schedule</span>
            <span>
              DAY {meterReading.cycleDay} OF {meterReading.totalCycleDays}
            </span>
          </div>
        </div>

        {/* Bill Projection Highlight with Mini Gauge */}
        <div className="flex items-center justify-between gap-4 relative z-10 pt-1">
          <div className="flex flex-col">
            <span className="font-label-sm text-xs uppercase text-[var(--text-muted)] tracking-wider">
              Est. Bi-Monthly Bill
            </span>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="font-headline-lg-mobile text-3xl sm:text-4xl font-extrabold text-[var(--text-main)] tracking-tight flex items-center">
                <Rupee size={28} />{formatCurrency(currentBillResult.totalBill)}
              </span>
              <span className={`font-label-sm text-xs font-bold tracking-tight uppercase px-2 py-0.5 rounded-md ${
                currentBillResult.isCliffCrossed
                  ? 'bg-[var(--color-danger-glow)] text-[var(--color-danger)]'
                  : 'bg-[var(--color-success-glow)] text-[var(--color-success)]'
              }`}>
                {currentBillResult.isCliffCrossed ? 'HIGH CONSUMPTION' : 'ACTIVE REGIME'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2.5 py-1 rounded-md bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--color-success)] font-label-sm text-xs font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                {currentBillResult.isCliffCrossed ? 'CLIFF CONCESSIONS LOST' : '200 UNITS SUBSIDY ACTIVE'}
              </span>
            </div>
          </div>

          {/* Mini Circular Arc Indicator for Cycle Duration */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
            <svg className="w-18 h-18 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[var(--card-bg-elevated)]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-[var(--color-primary)] transition-all duration-700 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${cyclePercent}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-label-numeric text-sm sm:text-base font-bold leading-none text-[var(--text-main)]">{cyclePercent}%</span>
              <span className="font-label-sm text-[9px] text-[var(--text-muted)] uppercase mt-0.5 font-semibold">CYCLE</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Grid Telemetry KPIs */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: Actual Meter Register */}
        <div
          onClick={() => setActiveTab('meter-log')}
          className="flex flex-col justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] relative overflow-hidden group cursor-pointer hover:border-[var(--color-primary)] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Meter Register
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] shadow-sm" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--color-success)]">
                {registeredUnits}
              </span>
              <span className="font-label-sm text-xs font-bold text-[var(--color-success)]">kWh</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[var(--text-muted)] font-label-sm text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-[var(--color-success)]">check_circle</span>
              <span>Verified Optical Read</span>
            </div>
          </div>
        </div>

        {/* Card 2: Appliance Baseline */}
        <div
          onClick={() => setActiveTab('devices')}
          className="flex flex-col justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] relative overflow-hidden group cursor-pointer hover:border-[var(--color-primary)] transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Load Baseline
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-sm" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)]">
                {baselineKwh}
              </span>
              <span className="font-label-sm text-xs font-bold text-[var(--color-primary)]">kWh</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[var(--text-muted)] font-label-sm text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">memory</span>
              <span>IoT Sensor Aggregate</span>
            </div>
          </div>
        </div>

        {/* Card 3: Telemetry Discrepancy */}
        <div className="flex flex-col justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Discrepancy
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] shadow-sm" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--color-warning)]">
                {discrepancy.diffKwh > 0 ? `+${discrepancy.diffKwh}` : discrepancy.diffKwh}
              </span>
              <span className="font-label-sm text-xs font-bold text-[var(--color-warning)]">kWh</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[var(--text-muted)] font-label-sm text-[11px]">
              <span className="font-label-numeric font-bold text-[var(--color-warning)]">
                {discrepancy.percentage > 0 ? `+${discrepancy.percentage}%` : `${discrepancy.percentage}%`}
              </span>
              <span>Standby / Duty Offset</span>
            </div>
          </div>
        </div>

        {/* Card 4: Projected 60-Day Units */}
        <div className="flex flex-col justify-between p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              60D Forecast
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                forecastKwh <= 500 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
              }`}
            />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--text-main)]">
                {forecastKwh}
              </span>
              <span className="font-label-sm text-xs font-bold text-[var(--text-muted)]">kWh</span>
            </div>
            <div
              className={`flex items-center gap-1.5 mt-1.5 font-label-sm text-[11px] ${
                forecastKwh <= 500 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">security</span>
              <span className="font-semibold">
                {forecastKwh <= 500
                  ? `Buffer: +${500 - forecastKwh} kWh Safe`
                  : `Over Cliff: -${forecastKwh - 500} kWh`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 500-Unit Subsidy Cliff Gauge (Tamil Nadu Policy) */}
      <section className="flex flex-col gap-3 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-warning)] text-[22px]">warning_amber</span>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-[var(--text-main)] tracking-tight">
              500-UNIT CLIFF MONITOR
            </h2>
          </div>
          <span
            className={`font-label-sm text-xs px-2.5 py-1 rounded-md border tracking-wider font-bold ${
              currentBillResult.bufferUnits > 0
                ? 'bg-[var(--color-success-glow)] text-[var(--color-success)] border-[var(--color-success)]/30'
                : 'bg-[var(--color-danger-glow)] text-[var(--color-danger)] border-[var(--color-danger)]/30 animate-pulse'
            }`}
          >
            {currentBillResult.bufferUnits > 0
              ? `${currentBillResult.bufferUnits} kWh BUFFER`
              : 'CLIFF BREACHED'}
          </span>
        </div>

        <p className="font-body-md text-xs sm:text-[13px] text-[var(--text-muted)] leading-relaxed">
          Crossing 500 kWh eliminates slab concessions, applying an acute ₹1,500+ tariff step-penalty to all previous units.
        </p>

        {/* Multi-Segment Visual Gauge (Scale 0 - 600 kWh) */}
        <div className="mt-3 flex flex-col gap-2 relative">
          <div className="h-4 w-full rounded-full bg-[var(--card-bg-elevated)] p-0.5 flex gap-1 items-center relative overflow-visible border border-[var(--card-border)]">
            {/* Tier 1: 0 - 200 (100% Free / Subsidized) -> 33.3% of 600 */}
            <div
              className="h-full rounded-l-full bg-[var(--color-success)] opacity-90 shadow-sm"
              style={{ width: '33.33%' }}
              title="0 - 200 kWh: Subsidized / Free tier"
            />
            {/* Tier 2: 201 - 400 (Concessional) -> 33.3% of 600 */}
            <div
              className="h-full bg-[var(--color-primary)] opacity-85 shadow-sm"
              style={{ width: '33.33%' }}
              title="201 - 400 kWh: Concessional tier"
            />
            {/* Tier 3: 401 - 500 (Caution Zone) -> 16.6% of 600 */}
            <div
              className="h-full bg-[var(--color-warning)] opacity-90 shadow-sm"
              style={{ width: '16.66%' }}
              title="401 - 500 kWh: Caution buffer zone"
            />
            {/* Tier 4: >500 (Cliff Penalty Spike) -> 16.7% of 600 */}
            <div
              className="h-full rounded-r-full bg-[var(--color-danger)] opacity-90 shadow-sm"
              style={{ width: '16.68%' }}
              title=">500 kWh: Cliff step-penalty"
            />

            {/* Indicator Pin positioned at current registered units */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-2.5 z-20 flex flex-col items-center pointer-events-none transition-all duration-500"
              style={{ left: `${pinPercent}%` }}
            >
              <div className="w-5 h-5 rounded-full bg-[var(--text-main)] border-2 border-[var(--color-primary)] flex items-center justify-center shadow-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              </div>
            </div>
          </div>

          {/* Segment Labels */}
          <div className="flex justify-between font-label-sm text-[11px] text-[var(--text-muted)] px-1 font-semibold">
            <span>0 kWh</span>
            <span className="text-[var(--color-success)]">200 (Free)</span>
            <span className="text-[var(--color-primary)]">400</span>
            <span className="text-[var(--color-warning)] font-bold">500 (CLIFF)</span>
            <span className="text-[var(--color-danger)]">600+</span>
          </div>
        </div>

        {/* Active Tooltip Banner */}
        <div className="mt-2.5 p-3 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px] shrink-0">speed</span>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-xs text-[var(--text-main)] font-bold tracking-wide">
              PINNED AT {registeredUnits} kWh (REGISTERED)
            </span>
            <span className="font-body-md text-xs text-[var(--text-muted)] leading-relaxed">
              {remainingDays > 0
                ? `Strictly restrict daily run rate under ${maxSafeDailyRate} kWh/day to maintain buffer.`
                : 'Billing cycle completed.'}
            </span>
          </div>
        </div>
      </section>

      {/* Load Distribution Breakdown */}
      <section className="flex flex-col gap-3 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)]">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-base sm:text-lg font-bold text-[var(--text-main)] tracking-tight">
            LOAD BREAKDOWN
          </h2>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-xs text-[var(--text-muted)] uppercase tracking-wider hidden sm:inline font-semibold">
              Real-Time Telemetry
            </span>
            <button
              onClick={openAddApplianceModal}
              className="px-3 py-1 rounded-lg bg-[var(--card-bg-elevated)] border border-[var(--card-border)] hover:border-[var(--color-primary)] text-[var(--color-primary)] font-label-sm text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Add Device</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-1.5">
          {appliances.filter((a) => a.isActive).map((app, idx) => {
            const kwh = Math.round(calculateApplianceKwh(app.wattage, app.quantity, app.dailyHours, app.daysUsed));
            const percentage = baselineKwh > 0 ? Math.round((kwh / baselineKwh) * 100) : 0;
            const iconName = getApplianceIcon(app.category, app.name);

            // Refined accent colors
            const barColors = [
              'bg-[#38bdf8]', // Cyan
              'bg-[#10b981]', // Emerald
              'bg-[#818cf8]', // Indigo
              'bg-[#f59e0b]', // Amber
              'bg-[#a855f7]', // Purple
              'bg-[#06b6d4]', // Teal
            ];
            const barColor = barColors[idx % barColors.length];

            return (
              <div
                key={app.id}
                onClick={() => openEditApplianceModal(app)}
                className="flex flex-col gap-1.5 group cursor-pointer hover:bg-[var(--card-bg-elevated)] p-2 rounded-xl transition-all"
                title="Click to edit appliance parameters"
              >
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-body-md font-semibold text-[var(--text-main)] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px] text-[var(--color-primary)]">
                      {iconName}
                    </span>
                    {app.name}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="font-label-numeric text-xs sm:text-sm text-[var(--text-main)] font-semibold">
                      {kwh} kWh
                    </span>
                    <span className="font-label-sm text-xs text-[var(--text-muted)] font-bold min-w-[32px] text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--card-bg-elevated)] overflow-hidden border border-[var(--card-border-subtle)]">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(3, percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Actionable Algorithmic Energy Insights */}
      <section className="flex flex-col gap-3.5 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] relative overflow-hidden">
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex items-center justify-center text-[var(--color-primary)] shrink-0 mt-0.5 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-xs uppercase text-[var(--color-primary)] tracking-wider font-bold">
              Algorithmic Safeguard
            </span>
            <h3 className="font-headline-sm text-base sm:text-lg font-bold text-[var(--text-main)]">
              {primaryRecommendation.title}
            </h3>
            <p className="font-body-md text-xs sm:text-[13px] text-[var(--text-muted)] leading-relaxed mt-0.5">
              {primaryRecommendation.description}
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={handleSimulateClick}
          id="btn-tariff-sim"
          className="w-full mt-2 py-3 px-4 rounded-xl bg-[var(--color-primary)] text-slate-950 font-body-lg text-xs sm:text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-md relative z-10 cursor-pointer"
        >
          {simButtonFeedback ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">
                refresh
              </span>
              <span>{simButtonFeedback}</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">insights</span>
              <span>Simulate Tariff Scenarios</span>
            </>
          )}
        </button>
      </section>
    </div>
  );
};
