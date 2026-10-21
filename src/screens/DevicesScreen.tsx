import React, { useState } from 'react';
import { useWattWise } from '../context/WattWiseContext.tsx';
import { calculateApplianceKwh, Appliance } from '../utils/tariffCalculations.ts';

export const DevicesScreen: React.FC = () => {
  const {
    appliances,
    baselineKwh,
    toggleAppliance,
    deleteAppliance,
    updateAppliance,
    addAppliance,
    openAddApplianceModal,
    openEditApplianceModal,
  } = useWattWise();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Loads' },
    { id: 'cooling', label: 'Cooling' },
    { id: 'refrigeration', label: 'Fridge' },
    { id: 'ventilation', label: 'Fans' },
    { id: 'heating', label: 'Geysers' },
    { id: 'lighting', label: 'Lighting' },
    { id: 'entertainment', label: 'Media' },
    { id: 'kitchen', label: 'Kitchen' },
  ];

  const filteredAppliances = appliances.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.notes && app.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDuplicate = (app: Appliance) => {
    addAppliance({
      name: `${app.name} (Copy)`,
      category: app.category,
      wattage: app.wattage,
      quantity: app.quantity,
      dailyHours: app.dailyHours,
      daysUsed: app.daysUsed,
      thermostatTemp: app.thermostatTemp,
      isActive: app.isActive,
      notes: app.notes,
    });
  };

  const handleHoursStep = (app: Appliance, delta: number) => {
    const newHours = Math.max(0.1, Math.min(24, Math.round((app.dailyHours + delta) * 10) / 10));
    updateAppliance(app.id, { dailyHours: newHours });
  };

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4 max-w-5xl mx-auto pb-24">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-[24px]">precision_manufacturing</span>
            <h1 className="font-headline-sm text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
              APPLIANCE INVENTORY
            </h1>
          </div>
          <p className="font-body-md text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Manage household electrical loads, duty cycles, and real-time wattages.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="font-label-sm text-[11px] uppercase text-[var(--text-muted)] font-semibold">Baseline Load</span>
            <div className="flex items-baseline justify-end gap-1 mt-0.5">
              <span className="font-headline-sm text-xl sm:text-2xl font-extrabold text-[var(--color-primary)]">{baselineKwh}</span>
              <span className="font-label-sm text-xs font-bold text-[var(--color-primary)]">kWh</span>
            </div>
          </div>
          <button
            onClick={openAddApplianceModal}
            className="py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-slate-950 font-body-md text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appliances, rooms, notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--color-primary)] text-xs sm:text-sm font-body-md transition-all shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl font-body-md text-xs uppercase font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-primary)] text-slate-950 border-[var(--color-primary)] shadow-sm'
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appliance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredAppliances.map((app) => {
          const kwh = calculateApplianceKwh(app.wattage, app.quantity, app.dailyHours, app.daysUsed);
          const share = baselineKwh > 0 ? Math.round((kwh / baselineKwh) * 100) : 0;

          return (
            <div
              key={app.id}
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col gap-3.5 transition-all relative overflow-hidden shadow-sm ${
                app.isActive
                  ? 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-border-hover)]'
                  : 'bg-[var(--card-bg-subtle)] border-[var(--card-border)] opacity-60'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAppliance(app.id)}
                    aria-label={`Toggle ${app.name} ${app.isActive ? 'off' : 'on'}`}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      app.isActive
                        ? 'bg-[var(--card-bg-elevated)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-sm'
                        : 'bg-[var(--card-bg-subtle)] border-[var(--card-border)] text-[var(--text-dim)]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {app.isActive ? 'power' : 'power_off'}
                    </span>
                  </button>
                  <div>
                    <h3 className="font-title-md text-[var(--text-main)] font-bold text-sm sm:text-base leading-tight">
                      {app.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-label-sm text-[10px] uppercase text-[var(--color-indigo)] font-semibold">
                        {app.category}
                      </span>
                      {app.notes && (
                        <span className="font-body-md text-xs text-[var(--text-muted)] truncate max-w-[150px]">
                          • {app.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Energy Badge */}
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-sm text-lg sm:text-xl font-bold text-[var(--color-primary)]">{kwh}</span>
                    <span className="font-label-sm text-xs font-semibold text-[var(--color-primary)]">kWh</span>
                  </div>
                  <span className="font-label-sm text-[11px] text-[var(--text-muted)] font-medium">
                    {share}% of load
                  </span>
                </div>
              </div>

              {/* Specs & Duty Steppers */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-xs font-body-md">
                <div className="flex flex-col">
                  <span className="text-[var(--text-muted)] font-label-sm text-[10px] uppercase font-semibold">Draw & Qty</span>
                  <span className="text-[var(--text-main)] font-semibold mt-1">
                    {app.wattage}W × {app.quantity} ({app.wattage * app.quantity}W total)
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[var(--text-muted)] font-label-sm text-[10px] uppercase font-semibold">Daily Runtime</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => handleHoursStep(app, -0.5)}
                      title="Decrease 30 mins"
                      className="w-5 h-5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] hover:text-[var(--color-primary)] flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-[var(--color-success)] font-label-numeric text-xs font-bold">
                      {app.dailyHours}h/day
                    </span>
                    <button
                      onClick={() => handleHoursStep(app, 0.5)}
                      title="Increase 30 mins"
                      className="w-5 h-5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] hover:text-[var(--color-primary)] flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-[var(--card-border)] pt-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditApplianceModal(app)}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--card-bg-elevated)] hover:bg-[var(--card-border)] text-[var(--color-primary)] font-label-sm text-xs uppercase font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDuplicate(app)}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--card-bg-elevated)] hover:bg-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-label-sm text-xs uppercase font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>Duplicate</span>
                  </button>
                </div>

                {confirmDeleteId === app.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        deleteAppliance(app.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[var(--color-danger)] text-white font-label-sm text-xs font-bold cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1 rounded-md bg-[var(--card-bg-elevated)] text-[var(--text-muted)] font-label-sm text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(app.id)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--card-bg-elevated)] transition-colors cursor-pointer"
                    title="Delete appliance"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAppliances.length === 0 && (
        <div className="p-8 text-center rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col items-center justify-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-4xl text-[var(--text-dim)]">device_unknown</span>
          <p className="font-title-md text-[var(--text-muted)]">No appliances matched your filter.</p>
          <button
            onClick={openAddApplianceModal}
            className="mt-2 py-2 px-5 rounded-xl bg-[var(--color-primary)] text-slate-950 font-body-md uppercase tracking-wider font-bold cursor-pointer shadow-sm"
          >
            Add New Device
          </button>
        </div>
      )}
    </div>
  );
};
