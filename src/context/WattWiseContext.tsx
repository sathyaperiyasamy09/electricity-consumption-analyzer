import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Appliance,
  MeterReading,
  DEFAULT_APPLIANCES,
  DEFAULT_METER_READING,
  calculateTotalInventoryKwh,
  calculateForecastKwh,
  calculateDiscrepancy,
  calculateTamilNaduBill,
  BillCalculationResult,
  generatePersonalizedRecommendations,
  Recommendation,
  simulateScenario,
  SimulationResult,
} from '../utils/tariffCalculations.ts';

export type ActiveTab = 'telemetry' | 'devices' | 'meter-log' | 'tariff' | 'simulation' | 'settings';
export type AppTheme = 'slate' | 'cyber' | 'light';

interface WattWiseContextType {
  userName: string;
  setUserName: (name: string) => void;
  hasCompletedWelcome: boolean;
  setHasCompletedWelcome: (val: boolean) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  cycleTheme: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  appliances: Appliance[];
  addAppliance: (appliance: Omit<Appliance, 'id'>) => void;
  updateAppliance: (id: string, updates: Partial<Appliance>) => void;
  deleteAppliance: (id: string) => void;
  toggleAppliance: (id: string) => void;
  meterReading: MeterReading;
  updateMeterReading: (updates: Partial<MeterReading>) => void;
  resetToDefaults: () => void;
  
  // Computed values
  registeredUnits: number;
  baselineKwh: number;
  forecastKwh: number;
  discrepancy: { diffKwh: number; percentage: number };
  currentBillResult: BillCalculationResult;
  forecastBillResult: BillCalculationResult;
  recommendations: Recommendation[];

  // Simulation state
  simulationHoursDelta: Record<string, number>;
  simulationThermostatTargets: Record<string, number>;
  setSimulationHourDelta: (applianceId: string, hours: number) => void;
  setSimulationThermostatTarget: (applianceId: string, temp: number) => void;
  resetSimulation: () => void;
  simulationResult: SimulationResult;
  applySimulationToInventory: () => void;

  // Modals
  isApplianceModalOpen: boolean;
  editingAppliance: Appliance | null;
  openAddApplianceModal: () => void;
  openEditApplianceModal: (appliance: Appliance) => void;
  closeApplianceModal: () => void;
}

const WattWiseContext = createContext<WattWiseContextType | undefined>(undefined);

const STORAGE_KEY_APPLIANCES = 'wattwise_appliances_v2';
const STORAGE_KEY_METER = 'wattwise_meter_v2';
const STORAGE_KEY_USER = 'wattwise_user_v2';
const STORAGE_KEY_WELCOME = 'wattwise_welcome_done_v2';
const STORAGE_KEY_THEME = 'wattwise_theme_v2';

export const WattWiseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check for ?autostart=1 in URL query
  const queryParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isAutostart = queryParams.get('autostart') === '1';

  // Theme State: 'slate' (Executive Dark), 'light' (Clean Professional Light), 'cyber' (Phosphor Cyber HUD)
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'slate';
    const saved = localStorage.getItem(STORAGE_KEY_THEME) as AppTheme | null;
    return saved || 'slate';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
  };

  const cycleTheme = () => {
    const themes: AppTheme[] = ['slate', 'light', 'cyber'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('theme-slate', 'theme-light', 'theme-cyber');
      document.documentElement.classList.add(`theme-${theme}`);
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, [theme]);

  // User & Welcome State
  const [userName, setUserNameState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Karthik';
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved || 'Karthik';
  });

  const [hasCompletedWelcome, setHasCompletedWelcomeState] = useState<boolean>(() => {
    if (isAutostart) return true;
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(STORAGE_KEY_WELCOME);
    return saved === 'true';
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('telemetry');

  // Appliances
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_APPLIANCES;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPLIANCES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_APPLIANCES;
  });

  // Meter Reading
  const [meterReading, setMeterReading] = useState<MeterReading>(() => {
    if (typeof window === 'undefined') return DEFAULT_METER_READING;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_METER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_METER_READING;
  });

  // Simulation offsets
  const [simulationHoursDelta, setSimulationHoursDelta] = useState<Record<string, number>>({});
  const [simulationThermostatTargets, setSimulationThermostatTargets] = useState<Record<string, number>>({
    'app-ac-1': 24, // Initial preset target of 24 deg C
  });

  // Modal state
  const [isApplianceModalOpen, setIsApplianceModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPLIANCES, JSON.stringify(appliances));
  }, [appliances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_METER, JSON.stringify(meterReading));
  }, [meterReading]);

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem(STORAGE_KEY_USER, name);
  };

  const setHasCompletedWelcome = (val: boolean) => {
    setHasCompletedWelcomeState(val);
    localStorage.setItem(STORAGE_KEY_WELCOME, val ? 'true' : 'false');
  };

  // Appliance operations
  const addAppliance = (app: Omit<Appliance, 'id'>) => {
    const newId = `app-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setAppliances((prev) => [...prev, { ...app, id: newId }]);
  };

  const updateAppliance = (id: string, updates: Partial<Appliance>) => {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAppliance = (id: string) => {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  };

  const updateMeterReading = (updates: Partial<MeterReading>) => {
    setMeterReading((prev) => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setAppliances(DEFAULT_APPLIANCES);
    setMeterReading(DEFAULT_METER_READING);
    setSimulationHoursDelta({});
    setSimulationThermostatTargets({ 'app-ac-1': 24 });
    setUserName('Karthik');
  };

  // Modals
  const openAddApplianceModal = () => {
    setEditingAppliance(null);
    setIsApplianceModalOpen(true);
  };

  const openEditApplianceModal = (app: Appliance) => {
    setEditingAppliance(app);
    setIsApplianceModalOpen(true);
  };

  const closeApplianceModal = () => {
    setEditingAppliance(null);
    setIsApplianceModalOpen(false);
  };

  // Simulation setters
  const setSimulationHourDelta = (applianceId: string, hours: number) => {
    setSimulationHoursDelta((prev) => ({
      ...prev,
      [applianceId]: Math.max(0, hours),
    }));
  };

  const setSimulationThermostatTarget = (applianceId: string, temp: number) => {
    setSimulationThermostatTargets((prev) => ({
      ...prev,
      [applianceId]: temp,
    }));
  };

  const resetSimulation = () => {
    setSimulationHoursDelta({});
    setSimulationThermostatTargets({ 'app-ac-1': 24 });
  };

  const applySimulationToInventory = () => {
    setAppliances((prev) =>
      prev.map((app) => {
        let updated = { ...app };
        if (simulationHoursDelta[app.id] !== undefined) {
          updated.dailyHours = Math.max(0, Math.round((updated.dailyHours - simulationHoursDelta[app.id]) * 10) / 10);
        }
        if (simulationThermostatTargets[app.id] !== undefined && app.thermostatTemp) {
          updated.thermostatTemp = simulationThermostatTargets[app.id];
        }
        return updated;
      })
    );
    resetSimulation();
  };

  // Calculations
  const registeredUnits = Math.max(0, meterReading.currentReading - meterReading.initialReading);
  const baselineKwh = calculateTotalInventoryKwh(appliances);
  const forecastKwh = calculateForecastKwh(registeredUnits, meterReading.cycleDay, meterReading.totalCycleDays);
  const discrepancy = calculateDiscrepancy(registeredUnits, baselineKwh);
  const currentBillResult = calculateTamilNaduBill(registeredUnits);
  const forecastBillResult = calculateTamilNaduBill(forecastKwh);
  const recommendations = generatePersonalizedRecommendations(appliances, forecastKwh);
  const simulationResult = simulateScenario(appliances, simulationHoursDelta, simulationThermostatTargets);

  return (
    <WattWiseContext.Provider
      value={{
        userName,
        setUserName,
        hasCompletedWelcome,
        setHasCompletedWelcome,
        theme,
        setTheme,
        cycleTheme,
        activeTab,
        setActiveTab,
        appliances,
        addAppliance,
        updateAppliance,
        deleteAppliance,
        toggleAppliance,
        meterReading,
        updateMeterReading,
        resetToDefaults,
        registeredUnits,
        baselineKwh,
        forecastKwh,
        discrepancy,
        currentBillResult,
        forecastBillResult,
        recommendations,
        simulationHoursDelta,
        simulationThermostatTargets,
        setSimulationHourDelta,
        setSimulationThermostatTarget,
        resetSimulation,
        simulationResult,
        applySimulationToInventory,
        isApplianceModalOpen,
        editingAppliance,
        openAddApplianceModal,
        openEditApplianceModal,
        closeApplianceModal,
      }}
    >
      {children}
    </WattWiseContext.Provider>
  );
};

export const useWattWise = () => {
  const context = useContext(WattWiseContext);
  if (!context) {
    throw new Error('useWattWise must be used within a WattWiseProvider');
  }
  return context;
};
