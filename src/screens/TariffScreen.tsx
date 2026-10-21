import React, { useState } from 'react';
import { useWattWise } from '../context/WattWiseContext.tsx';
import { calculateTamilNaduBill } from '../utils/tariffCalculations.ts';
import { Rupee, formatCurrency } from '../components/Rupee.tsx';

export const TariffScreen: React.FC = () => {
  const { registeredUnits } = useWattWise();
  const [testUnits, setTestUnits] = useState<number>(registeredUnits || 460);

  const bill = calculateTamilNaduBill(testUnits);
  const bill500 = calculateTamilNaduBill(500);
  const bill501 = calculateTamilNaduBill(501);
  const cliffPenalty = bill501.totalBill - bill500.totalBill;

  return (
    <div className="flex flex-col w-full px-4 py-4 gap-4 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-[24px]">calculate</span>
          <h1 className="font-headline-sm text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
            TAMIL NADU DOMESTIC TARIFF (LT-1A) ENGINE
          </h1>
        </div>
        <p className="font-body-md text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Official TNERC bi-monthly rate slabs, government subsidy model, and 500-unit cliff rules.
        </p>
      </div>

      {/* Assumptions & Policy Callout */}
      <section className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[var(--color-success)]">
          <span className="material-symbols-outlined text-[20px]">policy</span>
          <h2 className="font-label-sm text-xs uppercase tracking-wider font-bold">
            Stated Tariff & Subsidy Assumptions
          </h2>
        </div>
        <ul className="text-xs sm:text-sm font-body-md text-[var(--text-muted)] space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-[var(--text-main)]">Bi-Monthly Cycle:</strong> TANGEDCO bills domestic consumers once every 60 days (2 calendar months).
          </li>
          <li>
            <strong className="text-[var(--text-main)]">100 Units Free Subsidy:</strong> The Government of Tamil Nadu provides the first 100 kWh 100% free (<Rupee size={12} />0/unit) to all domestic consumers.
          </li>
          <li>
            <strong className="text-[var(--text-main)]">500-Unit Threshold Concession:</strong> If total bi-monthly consumption remains at or below 500 kWh, slab 101–200 is heavily subsidized at <Rupee size={12} />2.25/unit, and fixed charges are waived.
          </li>
          <li>
            <strong className="text-[var(--color-danger)]">The 500-Unit Cliff:</strong> Exceeding 500 kWh eliminates slab concessions retrospectively, raising units 101–400 to standard rates and units 401–500 to <Rupee size={12} />8.00/unit, triggering a sharp jump.
          </li>
        </ul>
      </section>

      {/* Interactive Slab Simulator Slider */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-label-sm text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Interactive Units Inspector
            </span>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="font-headline-lg text-3xl sm:text-4xl font-extrabold text-[var(--color-primary)]">{testUnits}</span>
              <span className="font-label-sm text-sm text-[var(--text-muted)] font-bold">kWh</span>
              <span
                className={`font-label-sm text-xs px-2.5 py-0.5 rounded-md border uppercase font-bold ${
                  bill.isCliffCrossed
                    ? 'bg-[var(--color-danger-glow)] text-[var(--color-danger)] border-[var(--color-danger)]/30'
                    : 'bg-[var(--color-success-glow)] text-[var(--color-success)] border-[var(--color-success)]/30'
                }`}
              >
                {bill.regime === 'CONCESSIONAL' ? 'Concessional Slab' : 'High Consumption Tier'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="font-label-sm text-[11px] text-[var(--text-muted)] uppercase font-semibold">Estimated Bill</span>
            <span className="font-headline-lg text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] flex items-center">
              <Rupee size={24} />{formatCurrency(bill.totalBill)}
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="900"
          step="5"
          value={testUnits}
          onChange={(e) => setTestUnits(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)] cursor-pointer"
        />

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 font-label-sm text-xs">
          {[100, 200, 350, 460, 495, 500, 505, 650, 800].map((preset) => (
            <button
              key={preset}
              onClick={() => setTestUnits(preset)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                testUnits === preset
                  ? 'bg-[var(--color-primary)] text-slate-950 border-[var(--color-primary)] font-bold shadow-sm'
                  : preset === 500 || preset === 505
                  ? 'bg-[var(--card-bg-elevated)] border-[var(--color-warning)] text-[var(--color-warning)]'
                  : 'bg-[var(--card-bg-elevated)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {preset} kWh {preset === 500 ? '(Cliff Edge)' : preset === 505 ? '(Post-Cliff)' : ''}
            </button>
          ))}
        </div>
      </section>

      {/* Slabs Breakdown Table */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-elevation)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="font-title-md text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-[22px]">table_chart</span>
            <span>Slab-by-Slab Calculation for {testUnits} kWh</span>
          </h2>
          <span className="font-label-sm text-xs text-[var(--color-success)] font-semibold flex items-center">
            Subsidies Deducted:&nbsp;<Rupee size={12} />{formatCurrency(bill.subsidySavingsValue)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-md text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-[var(--text-muted)] font-label-sm uppercase text-[11px] font-semibold">
                <th className="py-2.5 px-3">Slab Tier</th>
                <th className="py-2.5 px-3">Rate (<Rupee size={10} />/kWh)</th>
                <th className="py-2.5 px-3">Units in Slab</th>
                <th className="py-2.5 px-3 text-right">Cost (<Rupee size={10} />)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {bill.slabs.map((slab, i) => (
                <tr key={i} className="hover:bg-[var(--card-bg-elevated)]/50 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-2 font-medium text-[var(--text-main)]">
                    {slab.isSubsidized && (
                      <span className="material-symbols-outlined text-[16px] text-[var(--color-success)]">
                        verified
                      </span>
                    )}
                    <span>{slab.label}</span>
                  </td>
                  <td className="py-3 px-3 font-label-numeric text-[var(--color-primary)] font-semibold">
                    {slab.ratePerUnit === 0 ? 'FREE' : <span className="flex items-center"><Rupee size={13} />{slab.ratePerUnit.toFixed(2)}</span>}
                  </td>
                  <td className="py-3 px-3 font-label-numeric text-[var(--text-muted)] font-medium">
                    {slab.unitsBilled} kWh
                  </td>
                  <td className="py-3 px-3 text-right font-label-numeric font-bold text-[var(--text-main)]">
                    <div className="flex items-center justify-end">
                      <Rupee size={13} />{formatCurrency(slab.cost)}
                    </div>
                  </td>
                </tr>
              ))}
              {bill.fixedCharges > 0 && (
                <tr className="text-[var(--color-warning)] font-medium">
                  <td className="py-3 px-3" colSpan={3}>
                    Domestic Fixed Connection Charge (&gt;500 units)
                  </td>
                  <td className="py-3 px-3 text-right font-label-numeric font-bold">
                    <div className="flex items-center justify-end">
                      <Rupee size={13} />{formatCurrency(bill.fixedCharges)}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--card-border)] font-bold text-sm sm:text-base">
                <td className="py-3.5 px-3 text-[var(--text-main)]" colSpan={3}>
                  Net Bi-Monthly Bill Payable
                </td>
                <td className="py-3.5 px-3 text-right text-[var(--color-primary)] font-headline-sm text-xl font-extrabold">
                  <div className="flex items-center justify-end">
                    <Rupee size={18} />{formatCurrency(bill.totalBill)}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* The 500-Unit Cliff Anatomy Card */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--color-danger)]/30 shadow-sm flex flex-col gap-3.5">
        <div className="flex items-center gap-2 text-[var(--color-danger)]">
          <span className="material-symbols-outlined text-[24px]">warning</span>
          <h2 className="font-headline-sm text-base sm:text-lg font-bold tracking-tight flex items-center">
            ANATOMY OF THE&nbsp;<Rupee size={18} />{cliffPenalty}+ CLIFF JUMP
          </h2>
        </div>

        <p className="font-body-md text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          Comparing exactly <strong>500 kWh</strong> vs <strong>501 kWh</strong> demonstrates why electricity conservation in Tamil Nadu hinges on staying under 500 units:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm font-body-md">
          <div className="p-4 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--card-border)]">
            <div className="flex justify-between items-center text-[var(--color-success)] font-bold">
              <span>At Exactly 500 kWh:</span>
              <span className="font-headline-sm text-lg sm:text-xl font-extrabold flex items-center">
                <Rupee size={18} />{formatCurrency(bill500.totalBill)}
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-xs mt-1.5 flex items-center flex-wrap leading-relaxed">
              Concessional rates apply across all units. Total payable is&nbsp;<Rupee size={11} />{formatCurrency(bill500.totalBill)}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--card-bg-elevated)] border border-[var(--color-danger)]/30">
            <div className="flex justify-between items-center text-[var(--color-danger)] font-bold">
              <span>At 501 kWh (+1 kWh):</span>
              <span className="font-headline-sm text-lg sm:text-xl font-extrabold flex items-center">
                <Rupee size={18} />{formatCurrency(bill501.totalBill)}
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-xs mt-1.5 flex items-center flex-wrap leading-relaxed">
              Crossing into high-consumption triggers&nbsp;<Rupee size={11} />{cliffPenalty} immediate step-penalty across earlier units!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
