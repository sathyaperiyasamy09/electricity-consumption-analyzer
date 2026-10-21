import React, { useState } from 'react';
import { WattWiseProvider, useWattWise } from './context/WattWiseContext.tsx';
import { Header } from './components/Header.tsx';
import { Navigation } from './components/Navigation.tsx';
import { WelcomeModal } from './components/WelcomeModal.tsx';
import { ApplianceFormModal } from './components/ApplianceFormModal.tsx';
import { TelemetryDashboard } from './screens/TelemetryDashboard.tsx';
import { DevicesScreen } from './screens/DevicesScreen.tsx';
import { MeterLogScreen } from './screens/MeterLogScreen.tsx';
import { TariffScreen } from './screens/TariffScreen.tsx';
import { SimulationScreen } from './screens/SimulationScreen.tsx';
import { SettingsScreen } from './screens/SettingsScreen.tsx';

const MainAppContent: React.FC = () => {
  const { activeTab, hasCompletedWelcome } = useWattWise();
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(!hasCompletedWelcome);

  return (
    <div className="bg-[var(--canvas-bg)] min-h-screen text-[var(--text-main)] font-body-md flex flex-col relative selection:bg-[var(--color-primary)] selection:text-slate-950 transition-colors duration-200">
      {/* Top Fixed Telemetry Header */}
      <Header onOpenProfile={() => setIsWelcomeModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20 pb-20 relative">
        {activeTab === 'telemetry' && <TelemetryDashboard />}
        {activeTab === 'devices' && <DevicesScreen />}
        {activeTab === 'meter-log' && <MeterLogScreen />}
        {activeTab === 'tariff' && <TariffScreen />}
        {activeTab === 'simulation' && <SimulationScreen />}
        {activeTab === 'settings' && (
          <SettingsScreen onOpenWelcome={() => setIsWelcomeModalOpen(true)} />
        )}
      </main>

      {/* Bottom Fixed Navigation Bar */}
      <Navigation />

      {/* Modals & Dialogs */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />
      <ApplianceFormModal />
    </div>
  );
};

export default function App() {
  return (
    <WattWiseProvider>
      <MainAppContent />
    </WattWiseProvider>
  );
}
