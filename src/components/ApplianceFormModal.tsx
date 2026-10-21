import React, { useState, useEffect } from 'react';
import { useWattWise } from '../context/WattWiseContext.tsx';
import { Appliance, calculateApplianceKwh } from '../utils/tariffCalculations.ts';

interface AppliancePreset {
  name: string;
  category: Appliance['category'];
  wattage: number;
  dailyHours: number;
  thermostatTemp?: number;
  icon: string;
}

const APPLIANCE_PRESETS: AppliancePreset[] = [
  { name: '1.5 Ton Inverter AC', category: 'cooling', wattage: 1050, dailyHours: 6, thermostatTemp: 22, icon: 'mode_fan' },
  { name: '1.0 Ton Split AC', category: 'cooling', wattage: 850, dailyHours: 5, thermostatTemp: 24, icon: 'ac_unit' },
  { name: 'Frost-Free Refrigerator (260L)', category: 'refrigeration', wattage: 150, dailyHours: 12, icon: 'kitchen' },
  { name: 'BLDC Energy Saving Fan', category: 'ventilation', wattage: 28, dailyHours: 12, icon: 'toys' },
  { name: 'Conventional Induction Fan', category: 'ventilation', wattage: 75, dailyHours: 12, icon: 'toys' },
  { name: 'Storage Geyser (15L/25L)', category: 'heating', wattage: 2000, dailyHours: 0.6, icon: 'water_heater' },
  { name: 'Smart LED TV 55"', category: 'entertainment', wattage: 110, dailyHours: 4, icon: 'tv' },
  { name: 'Fully Automatic Washing Machine', category: 'kitchen', wattage: 500, dailyHours: 1, icon: 'local_laundry_service' },
  { name: 'Microwave Oven', category: 'kitchen', wattage: 1200, dailyHours: 0.3, icon: 'microwave' },
  { name: 'Water Submersible Pump (1 HP)', category: 'heavy', wattage: 750, dailyHours: 0.75, icon: 'water' },
  { name: 'Home Office PC / Workstation', category: 'entertainment', wattage: 180, dailyHours: 8, icon: 'computer' },
  { name: 'Lighting & Standby Drain Array', category: 'lighting', wattage: 98, dailyHours: 10, icon: 'power' },
];

export const ApplianceFormModal: React.FC = () => {
  const { isApplianceModalOpen, editingAppliance, closeApplianceModal, addAppliance, updateAppliance, baselineKwh } = useWattWise();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Appliance['category']>('cooling');
  const [wattage, setWattage] = useState<number>(1000);
  const [quantity, setQuantity] = useState<number>(1);
  const [dailyHours, setDailyHours] = useState<number>(6);
  const [daysUsed, setDaysUsed] = useState<number>(60);
  const [thermostatTemp, setThermostatTemp] = useState<number>(24);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAppliance) {
      setName(editingAppliance.name);
      setCategory(editingAppliance.category);
      setWattage(editingAppliance.wattage);
      setQuantity(editingAppliance.quantity);
      setDailyHours(editingAppliance.dailyHours);
      setDaysUsed(editingAppliance.daysUsed);
      setThermostatTemp(editingAppliance.thermostatTemp || 24);
      setNotes(editingAppliance.notes || '');
      setStep(1);
    } else {
      // Default reset
      setName('1.5 Ton Inverter AC');
      setCategory('cooling');
      setWattage(1050);
      setQuantity(1);
      setDailyHours(6);
      setDaysUsed(60);
      setThermostatTemp(22);
      setNotes('');
      setStep(1);
    }
    setErrors({});
  }, [editingAppliance, isApplianceModalOpen]);

  if (!isApplianceModalOpen) return null;

  const handleApplyPreset = (preset: AppliancePreset) => {
    setName(preset.name);
    setCategory(preset.category);
    setWattage(preset.wattage);
    setDailyHours(preset.dailyHours);
    if (preset.thermostatTemp) setThermostatTemp(preset.thermostatTemp);
  };

  const calculatedKwh = calculateApplianceKwh(wattage, quantity, dailyHours, daysUsed);
  const newEstimatedTotalBaseline = editingAppliance
    ? Math.max(0, baselineKwh - calculateApplianceKwh(editingAppliance.wattage, editingAppliance.quantity, editingAppliance.dailyHours, editingAppliance.daysUsed) + calculatedKwh)
    : baselineKwh + calculatedKwh;

  const validateStep1 = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'Appliance name is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStep2 = () => {
    const err: Record<string, string> = {};
    if (wattage <= 0 || isNaN(wattage)) err.wattage = 'Wattage must be greater than 0';
    if (quantity < 1 || isNaN(quantity)) err.quantity = 'Quantity must be at least 1';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStep3 = () => {
    const err: Record<string, string> = {};
    if (dailyHours <= 0 || dailyHours > 24 || isNaN(dailyHours)) err.dailyHours = 'Daily usage must be between 0.1 and 24 hours';
    if (daysUsed < 1 || daysUsed > 60 || isNaN(daysUsed)) err.daysUsed = 'Days used must be between 1 and 60 days';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    const payload: Omit<Appliance, 'id'> = {
      name: name.trim(),
      category,
      wattage: Number(wattage),
      quantity: Number(quantity),
      dailyHours: Number(dailyHours),
      daysUsed: Number(daysUsed),
      thermostatTemp: category === 'cooling' ? Number(thermostatTemp) : undefined,
      isActive: true,
      notes: notes.trim() || undefined,
    };

    if (editingAppliance) {
      updateAppliance(editingAppliance.id, payload);
    } else {
      addAppliance(payload);
    }

    closeApplianceModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appliance-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] p-5 sm:p-7 shadow-2xl flex flex-col gap-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] flex items-center justify-center text-[var(--color-primary)] shadow-sm">
              <span className="material-symbols-outlined text-[20px]">
                {editingAppliance ? 'edit' : 'add_circle'}
              </span>
            </div>
            <div>
              <h2 id="appliance-modal-title" className="font-headline-sm text-base sm:text-lg font-bold text-[var(--text-main)] tracking-tight">
                {editingAppliance ? 'EDIT APPLIANCE' : 'STEP-BY-STEP APPLIANCE ENTRY'}
              </h2>
              <span className="font-label-sm text-xs text-[var(--text-muted)] font-medium">Step {step} of 4</span>
            </div>
          </div>
          <button
            onClick={closeApplianceModal}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--card-bg-elevated)] text-[var(--text-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-4 gap-2 font-label-sm text-xs font-semibold">
          {[
            { num: 1, label: 'Identity' },
            { num: 2, label: 'Power & Qty' },
            { num: 3, label: 'Usage Hours' },
            { num: 4, label: 'Review' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num === 1) setStep(1);
                if (s.num === 2 && validateStep1()) setStep(2);
                if (s.num === 3 && validateStep1() && validateStep2()) setStep(3);
                if (s.num === 4 && validateStep1() && validateStep2() && validateStep3()) setStep(4);
              }}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                step === s.num
                  ? 'bg-[var(--card-bg-elevated)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-sm font-bold'
                  : step > s.num
                  ? 'bg-[var(--card-bg-elevated)] border-[var(--card-border)] text-[var(--color-success)]'
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-dim)]'
              }`}
            >
              <span>Step {s.num}</span>
              <span className="font-medium">{s.label}</span>
            </button>
          ))}
        </div>

        {/* FORM CONTENT BY STEP */}
        <div className="flex flex-col gap-4 min-h-[260px]">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <label className="font-label-sm text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2 block">
                  Quick Load Preset:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                  {APPLIANCE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        name === p.name
                          ? 'bg-[var(--card-bg-elevated)] border-[var(--color-primary)] text-[var(--color-primary)] font-semibold shadow-sm'
                          : 'bg-[var(--card-bg-elevated)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--card-border-hover)]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px] shrink-0 text-[var(--color-primary)]">
                        {p.icon}
                      </span>
                      <span className="font-body-md text-xs truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="app-name-input" className="font-label-sm text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1.5 block">
                  Appliance Name:
                </label>
                <input
                  id="app-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 1.5 Ton Master Bedroom AC"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] focus:border-[var(--color-primary)] focus:outline-none font-body-md transition-all"
                />
                {errors.name && <p className="text-xs text-[var(--color-danger)] mt-1 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="app-category-select" className="font-label-sm text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1.5 block">
                  Category:
                </label>
                <select
                  id="app-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Appliance['category'])}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] focus:border-[var(--color-primary)] focus:outline-none font-body-md transition-all"
                >
                  <option value="cooling">Air Conditioning & Cooling</option>
                  <option value="refrigeration">Refrigeration</option>
                  <option value="ventilation">Ceiling Fans & Ventilation</option>
                  <option value="heating">Water Heaters & Geysers</option>
                  <option value="lighting">Lighting & Standby Loads</option>
                  <option value="entertainment">Television & Entertainment</option>
                  <option value="kitchen">Kitchen Appliances</option>
                  <option value="heavy">Pumps & Heavy Motors</option>
                  <option value="other">Other Domestic Load</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: POWER & QUANTITY */}
          {step === 2 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="app-wattage-input" className="font-label-sm text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    Rated Power (Watts):
                  </label>
                  <span className="font-label-sm text-xs text-[var(--color-indigo)] font-bold">
                    {wattage >= 1000 ? `${(wattage / 1000).toFixed(2)} kW` : `${wattage} W`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="app-wattage-input"
                    type="number"
                    min="1"
                    max="10000"
                    step="5"
                    value={wattage}
                    onChange={(e) => setWattage(Math.max(1, Number(e.target.value)))}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--color-primary)] font-label-numeric font-bold focus:border-[var(--color-primary)] focus:outline-none transition-all"
                  />
                  <div className="flex gap-1.5">
                    {[28, 75, 500, 1050, 1500, 2000].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWattage(w)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-label-sm border cursor-pointer font-medium ${
                          wattage === w
                            ? 'bg-[var(--color-primary)] text-slate-950 border-[var(--color-primary)] font-bold'
                            : 'bg-[var(--card-bg-elevated)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {w}W
                      </button>
                    ))}
                  </div>
                </div>
                {errors.wattage && <p className="text-xs text-[var(--color-danger)] mt-1 font-medium">{errors.wattage}</p>}
              </div>

              <div>
                <label className="font-label-sm text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1.5 block">
                  Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] hover:text-[var(--color-primary)] font-bold text-lg flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    -
                  </button>
                  <span className="font-headline-sm text-xl font-bold text-[var(--color-primary)] w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] hover:text-[var(--color-primary)] font-bold text-lg flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    +
                  </button>
                  <span className="font-label-sm text-xs text-[var(--text-muted)] font-medium">
                    Total load draw: {wattage * quantity} W
                  </span>
                </div>
              </div>

              {category === 'cooling' && (
                <div className="p-3.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] shadow-sm">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-label-sm text-xs uppercase tracking-wider text-[var(--color-warning)] font-bold">
                      AC Thermostat Setpoint:
                    </span>
                    <span className="font-label-numeric font-bold text-[var(--color-warning)]">{thermostatTemp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="28"
                    step="1"
                    value={thermostatTemp}
                    onChange={(e) => setThermostatTemp(Number(e.target.value))}
                    className="w-full accent-[var(--color-warning)] cursor-pointer"
                  />
                  <p className="font-body-md text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    Recommended TNERC standard: 24°C saves up to 24% compared to 20°C.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: USAGE HOURS & DAYS */}
          {step === 3 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="app-daily-hours-slider" className="font-label-sm text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    Daily Usage Hours:
                  </label>
                  <span className="font-label-numeric text-[var(--color-primary)] font-bold">{dailyHours} hrs / day</span>
                </div>
                <input
                  id="app-daily-hours-slider"
                  type="range"
                  min="0.2"
                  max="24"
                  step="0.2"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)] cursor-pointer"
                />
                <div className="flex gap-2 mt-2">
                  {[0.5, 2, 4, 6, 8, 12, 24].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDailyHours(h)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-label-sm border cursor-pointer font-medium ${
                        dailyHours === h
                          ? 'bg-[var(--color-primary)] text-slate-950 border-[var(--color-primary)] font-bold'
                          : 'bg-[var(--card-bg-elevated)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                {errors.dailyHours && <p className="text-xs text-[var(--color-danger)] mt-1 font-medium">{errors.dailyHours}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="app-days-used-slider" className="font-label-sm text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                    Days Used in 60-Day Billing Cycle:
                  </label>
                  <span className="font-label-numeric text-[var(--color-success)] font-bold">{daysUsed} days</span>
                </div>
                <input
                  id="app-days-used-slider"
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={daysUsed}
                  onChange={(e) => setDaysUsed(Number(e.target.value))}
                  className="w-full accent-[var(--color-success)] cursor-pointer"
                />
                <div className="flex gap-2 mt-2">
                  {[15, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysUsed(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-label-sm border cursor-pointer font-medium ${
                        daysUsed === d
                          ? 'bg-[var(--color-success)] text-slate-950 border-[var(--color-success)] font-bold'
                          : 'bg-[var(--card-bg-elevated)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {d === 60 ? 'Daily (60d)' : `${d} days`}
                    </button>
                  ))}
                </div>
                {errors.daysUsed && <p className="text-xs text-[var(--color-danger)] mt-1 font-medium">{errors.daysUsed}</p>}
              </div>

              <div>
                <label htmlFor="app-notes-input" className="font-label-sm text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1.5 block">
                  Location / Notes (Optional):
                </label>
                <input
                  id="app-notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Master Bedroom, Living room inverter"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] text-xs focus:border-[var(--color-primary)] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="flex flex-col gap-3.5 animate-fade-in">
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-bg-elevated)] border border-[var(--color-primary)]/40 shadow-sm flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--color-primary)]">bolt</span>
                    <span className="font-title-md text-base text-[var(--text-main)] font-bold">{name}</span>
                  </div>
                  <span className="font-label-sm uppercase px-2.5 py-0.5 rounded-md bg-[var(--card-bg)] text-[var(--color-indigo)] border border-[var(--card-border)] font-bold">
                    {category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-body-md border-t border-[var(--card-border)] pt-3">
                  <div>
                    <span className="text-[var(--text-muted)]">Power & Qty:</span>
                    <span className="text-[var(--text-main)] font-semibold block mt-0.5">{wattage}W × {quantity} unit(s)</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Run Time:</span>
                    <span className="text-[var(--text-main)] font-semibold block mt-0.5">{dailyHours}h/day for {daysUsed} days</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-between shadow-sm">
                  <div>
                    <span className="font-label-sm text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold">
                      Bi-Monthly Energy
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-md text-2xl font-extrabold text-[var(--color-primary)]">{calculatedKwh}</span>
                      <span className="font-label-sm text-xs font-bold text-[var(--color-primary)]">kWh</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-[11px] text-[var(--text-muted)] uppercase tracking-wider block font-semibold">
                      New Total Baseline
                    </span>
                    <div className="flex items-baseline justify-end gap-1 mt-1">
                      <span className="font-headline-md text-2xl font-extrabold text-[var(--color-success)]">{newEstimatedTotalBaseline}</span>
                      <span className="font-label-sm text-xs font-bold text-[var(--color-success)]">kWh</span>
                    </div>
                  </div>
                </div>

                <div className="font-body-md text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[var(--color-success)]">verified</span>
                  <span>Formula: ({wattage}W × {quantity} × {dailyHours}h × {daysUsed}d) ÷ 1,000 = {calculatedKwh} kWh</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-[var(--card-border)] pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="py-2.5 px-4 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)] text-[var(--text-main)] hover:text-[var(--color-primary)] font-body-md text-xs uppercase font-semibold tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-5 rounded-xl bg-[var(--color-primary)] text-slate-950 font-body-md uppercase tracking-wider font-bold hover:opacity-90 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Next</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="py-2.5 px-6 rounded-xl bg-[var(--color-success)] text-slate-950 font-body-md uppercase tracking-wider font-bold hover:opacity-90 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>{editingAppliance ? 'Save Changes' : 'Add to Inventory'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
