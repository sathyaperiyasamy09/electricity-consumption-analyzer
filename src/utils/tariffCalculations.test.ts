import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateApplianceKwh,
  calculateTotalInventoryKwh,
  calculateForecastKwh,
  calculateDiscrepancy,
  calculateTamilNaduBill,
  generatePersonalizedRecommendations,
  simulateScenario,
  DEFAULT_APPLIANCES,
} from './tariffCalculations.ts';

test('calculateApplianceKwh computes correct energy usage in kWh', () => {
  // 1000W appliance, 1 unit, 5 hours/day, 60 days = 300 kWh
  assert.equal(calculateApplianceKwh(1000, 1, 5, 60), 300);

  // 1050W AC, 1 unit, 6 hours/day, 60 days = 378 kWh
  assert.equal(calculateApplianceKwh(1050, 1, 6, 60), 378);

  // 28W BLDC fans, 4 units, 12 hours/day, 60 days = 80.64 kWh (~80.6 kWh)
  assert.equal(calculateApplianceKwh(28, 4, 12, 60), 80.6);

  // Zero inputs return 0
  assert.equal(calculateApplianceKwh(0, 1, 5, 60), 0);
  assert.equal(calculateApplianceKwh(500, 0, 5, 60), 0);
  assert.equal(calculateApplianceKwh(500, 1, 0, 60), 0);
});

test('calculateTotalInventoryKwh aggregates active appliances properly', () => {
  const total = calculateTotalInventoryKwh(DEFAULT_APPLIANCES);
  assert.ok(total > 600 && total < 800, `Expected total ~698 kWh, got ${total}`);
});

test('calculateForecastKwh extrapolates correctly for cycle days', () => {
  // 460 kWh on Day 42 with controlled run-rate -> 485 kWh benchmark
  const forecast = calculateForecastKwh(460, 42, 60);
  assert.equal(forecast, 485);

  // If already at 520 kWh on day 42 (over cliff), linear extrapolation -> (520 / 42) * 60 = 743
  const forecastOver = calculateForecastKwh(520, 42, 60);
  assert.equal(forecastOver, 743);
});

test('calculateDiscrepancy reports diff and percentage', () => {
  const result = calculateDiscrepancy(460, 698);
  assert.equal(result.diffKwh, -238);
  assert.equal(result.percentage, -34.1);
});

test('calculateTamilNaduBill accurately calculates concessional regime with 460 kWh benchmark', () => {
  const bill460 = calculateTamilNaduBill(460);
  // Benchmark from Stitch mockup: ₹1,323 at 460 kWh with 40 kWh buffer
  assert.equal(bill460.totalBill, 1323);
  assert.equal(bill460.isCliffCrossed, false);
  assert.equal(bill460.bufferUnits, 40);
  assert.equal(bill460.freeUnitsSubsidized, 100);
  assert.equal(bill460.regime, 'CONCESSIONAL');
});

test('calculateTamilNaduBill gives ₹0 for 100 units due to 100% free subsidy', () => {
  const bill100 = calculateTamilNaduBill(100);
  assert.equal(bill100.totalBill, 0);
  assert.equal(bill100.freeUnitsSubsidized, 100);
  assert.equal(bill100.isCliffCrossed, false);
});

test('calculateTamilNaduBill triggers cliff penalty when exceeding 500 units', () => {
  const bill500 = calculateTamilNaduBill(500);
  const bill501 = calculateTamilNaduBill(501);

  assert.equal(bill500.isCliffCrossed, false);
  assert.equal(bill501.isCliffCrossed, true);
  assert.equal(bill501.regime, 'HIGH_CONSUMPTION');
  assert.equal(bill501.bufferUnits, 0);

  // Exceeding 500 units should jump significantly
  assert.ok(bill501.totalBill > bill500.totalBill + 500, `Expected sharp cliff jump: 500u=${bill500.totalBill}, 501u=${bill501.totalBill}`);
});

test('generatePersonalizedRecommendations produces actionable tips for AC and geyser', () => {
  const recs = generatePersonalizedRecommendations(DEFAULT_APPLIANCES, 485);
  assert.ok(recs.length >= 2, 'Should generate multiple recommendations');

  const acRec = recs.find((r) => r.id === 'rec-ac-thermostat');
  assert.ok(acRec, 'Should include AC thermostat optimization');
  assert.ok(acRec.potentialKwhSavings > 30, 'AC savings should be substantial');
});

test('simulateScenario correctly reduces usage and computes savings', () => {
  const sim = simulateScenario(
    DEFAULT_APPLIANCES,
    { 'app-geyser-1': 0.3 },
    { 'app-ac-1': 24 }
  );

  assert.ok(sim.kwhSaved > 0, 'Should have positive kWh savings');
  assert.ok(sim.costSaved >= 0, 'Should have non-negative cost savings');
  assert.ok(sim.optimizedKwh < sim.currentKwh, 'Optimized kWh should be lower than baseline');
});
