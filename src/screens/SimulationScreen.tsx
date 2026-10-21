import React, { useState } from 'react';
import { useWattWise } from '../context/WattWiseContext.tsx';
import { Rupee, formatCurrency } from '../components/Rupee.tsx';

export const SimulationScreen: React.FC = () => {
  const {
    appliances,
    recommendations,
    simulationHoursDelta,
    simulationThermostatTargets,
    setSimulationHourDelta,
    setSimulationThermostatTarget,
    resetSimulation,
    simulationResult,
    applySimulationToInventory,
    setActiveTab,
  } = useWattWise();

  const [appliedNotification, setAppliedNotification] = useState(false);

  const handleApplyToInventory = () => {
    applySimulationToInventory();
    setAppliedNotification(true);
    setTimeout(() => {
      setAppliedNotification(false);
      setActiveTab('telemetry');
    }, 1200);
  };

  const handleApplyRecommendation = (recId: string) => {
    const rec = recommendations.find((r) => r.id === recId);
    if (!rec) return;

    if (rec.id === 'rec-ac-thermostat' && rec.applianceId) {
      setSimulationThermostatTarget(rec.applianceId, 24);
    } else if (rec.id === 'rec-geyser-timer' && rec.applianceId) {
      setSimulationHourDelta(rec.applianceId, 0.3);
    } else if (rec.id === 'rec-phantom-load' && rec.applianceId) {
      setSimulationHourDelta(rec.applianceId, 3.0);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-[24px]">insights</span>
            <h1 className="font-headline-sm text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
              TARIFF & USAGE REDUCTION SIMULATOR
            </h1>
          </div>
          <p className="font-body-md text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Model behavioral adjustments, setpoint shifts, and tariff cliff-avoidance savings.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="py-2 px-3.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] hover:border-[var(--color-danger)]/50 text-[var(--text-muted)] hover:text-[var(--color-danger)] font-body-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Reset Model</span>
        </button>
      </div>

      {appliedNotification && (
        <div className="p-3.5 rounded-xl bg-[var(--color-success-glow)] border border-[var(--color-success)]/40 text-[var(--color-success)] font-body-md text-xs sm:text-sm flex items-center gap-2 shadow-sm animate-fade-in font-medium">
          <span className="material-symbols-outlined text-[20px]">verified</span>
          <span>Simulation adjustments committed to your live household inventory! Redirecting...</span>
        </div>
      )}

      {/* Comparison KPI Board */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Current vs Optimized kWh */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col justify-between shadow-sm">
          <span className="font-label-sm text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Simulated Consumption
          </span>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)]">
                {simulationResult.optimizedKwh}
              </span>
              <span className="font-label-sm text-xs font-bold text-[var(--color-primary)]">kWh</span>
            </div>
            <span className="font-label-sm text-[11px] text-[var(--text-muted)] block mt-1">
              from {simulationResult.currentKwh} kWh baseline
            </span>
          </div>
        </div>

        {/* Energy Saved */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col justify-between shadow-sm">
          <span className="font-label-sm text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Energy Reduced
          </span>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--color-success)]">
                -{simulationResult.kwhSaved}
              </span>
              <span className="font-label-sm text-xs font-bold text-[var(--color-success)]">kWh</span>
            </div>
            <span className="font-label-sm text-[11px] text-[var(--color-success)] font-bold block mt-1">
              {simulationResult.currentKwh > 0
                ? `${((simulationResult.kwhSaved / simulationResult.currentKwh) * 100).toFixed(1)}% reduction`
                : '0%'}
            </span>
          </div>
        </div>

        {/* New Simulated Bill */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col justify-between shadow-sm">
          <span className="font-label-sm text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Projected Bi-Monthly Bill
          </span>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] flex items-center">
                <Rupee size={22} />{formatCurrency(simulationResult.optimizedBill)}
              </span>
            </div>
            <span className="font-label-sm text-[11px] text-[var(--text-muted)] flex items-center mt-1">
              Was&nbsp;<Rupee size={10} />{formatCurrency(simulationResult.currentBill)}
            </span>
          </div>
        </div>

        {/* Total Cost Saved */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--color-success)]/40 shadow-sm flex flex-col justify-between">
          <span className="font-label-sm text-[10px] sm:text-xs text-[var(--color-success)] uppercase tracking-wider font-bold">
            Estimated Savings
          </span>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-sm text-2xl sm:text-3xl font-extrabold text-[var(--color-success)] flex items-center">
                <Rupee size={22} />{formatCurrency(simulationResult.costSaved)}
              </span>
            </div>
            <span className="font-label-sm text-[11px] text-[var(--color-success)] font-bold block mt-1">
              {simulationResult.bufferSecured > 0
                ? `Buffer: +${simulationResult.bufferSecured} kWh`
                : 'Above cliff'}
            </span>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations & 1-Click Apply */}
      <section className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-[22px]">recommend</span>
          <h2 className="font-title-md text-base sm:text-lg font-bold text-[var(--text-main)]">
            Personalized Efficiency Safeguards
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex flex-col justify-between gap-3 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-title-md text-[var(--text-main)] font-bold text-sm sm:text-base">
                    {rec.title}
                  </span>
                  <span className="font-label-sm text-xs px-2.5 py-0.5 rounded-md bg-[var(--color-success-glow)] text-[var(--color-success)] font-bold">
                    Save ~{rec.potentialKwhSavings} kWh
                  </span>
                </div>
                <p className="font-body-md text-xs sm:text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--card-border)] pt-3">
                <span className="font-label-sm text-xs font-semibold text-[var(--color-primary)] flex items-center">
                  Estimated&nbsp;<Rupee size={12} />{formatCurrency(rec.potentialCostSavings)} saved
                </span>
                <button
                  onClick={() => handleApplyRecommendation(rec.id)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--color-primary)]/40 hover:border-[var(--color-primary)] text-[var(--color-primary)] hover:text-[var(--text-main)] font-label-sm text-xs uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                  <span>{rec.suggestedActionLabel}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Appliance Reduction Sliders */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-title-md text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary)]">tune</span>
            <span>Appliance Duty & Setpoint Controls</span>
          </h2>
          <span className="font-label-sm text-xs text-[var(--text-muted)] font-medium">
            Fine-tune usage to secure tariff concessions
          </span>
        </div>

        <div className="flex flex-col gap-3.5">
          {appliances.filter((a) => a.isActive).map((app) => {
            const currentReduction = simulationHoursDelta[app.id] || 0;
            const currentThermostat = simulationThermostatTargets[app.id] || app.thermostatTemp || 24;

            return (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex flex-col gap-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-[20px]">
                      {app.category === 'cooling'
                        ? 'mode_fan'
                        : app.category === 'heating'
                        ? 'water_heater'
                        : 'bolt'}
                    </span>
                    <span className="font-title-md text-sm sm:text-base text-[var(--text-main)] font-bold">
                      {app.name}
                    </span>
                  </div>
                  <span className="font-label-sm text-xs text-[var(--text-muted)]">
                    Baseline: {app.dailyHours}h/day ({app.wattage}W)
                  </span>
                </div>

                {/* Thermostat Control if AC */}
                {app.category === 'cooling' && app.thermostatTemp && (
                  <div className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-label-sm text-[var(--color-warning)] uppercase font-semibold">
                        AC Thermostat Target:
                      </span>
                      <span className="font-label-numeric text-[var(--color-warning)] font-bold">
                        {currentThermostat}°C (Baseline was {app.thermostatTemp}°C)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={app.thermostatTemp}
                      max="28"
                      step="1"
                      value={currentThermostat}
                      onChange={(e) => setSimulationThermostatTarget(app.id, Number(e.target.value))}
                      className="w-full accent-[var(--color-warning)] cursor-pointer"
                    />
                    <div className="flex justify-between font-label-sm text-[10px] text-[var(--text-muted)]">
                      <span>{app.thermostatTemp}°C (Base)</span>
                      <span className="font-semibold text-[var(--color-primary)]">24°C (Optimal)</span>
                      <span>28°C (Max Economy)</span>
                    </div>
                  </div>
                )}

                {/* Hours reduction slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-label-sm text-[var(--text-muted)] uppercase font-semibold">
                      Reduce Daily Runtime:
                    </span>
                    <span className="font-label-numeric text-[var(--color-success)] font-bold">
                      {currentReduction > 0
                        ? `-${currentReduction}h (New: ${Math.max(0, Math.round((app.dailyHours - currentReduction) * 10) / 10)}h/day)`
                        : 'No reduction'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.min(app.dailyHours, 8)}
                    step="0.5"
                    value={currentReduction}
                    onChange={(e) => setSimulationHourDelta(app.id, Number(e.target.value))}
                    className="w-full accent-[var(--color-success)] cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Commit Changes Button */}
        <div className="border-t border-[var(--card-border)] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-[var(--text-muted)] font-body-md">
            Save these optimized schedules directly into your live appliance inventory.
          </div>
          <button
            onClick={handleApplyToInventory}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[var(--color-success)] text-slate-950 font-body-md uppercase tracking-wider font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Commit to Inventory</span>
          </button>
        </div>
      </section>
    </div>
  );
};
