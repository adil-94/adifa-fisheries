import { useState } from 'react';
import { usePonds, useCrops, useWorkers, useSalaryPayments, useSeedChecks } from '../hooks/useFishery';
import { CropsTab } from '../components/fishery/CropsTab';
import { WorkersTab } from '../components/fishery/WorkersTab';
import { SalaryTab } from '../components/fishery/SalaryTab';
import { SeedChecksTab } from '../components/fishery/SeedChecksTab';
import { PondsOverview } from '../components/fishery/PondsOverview';

type TabType = 'overview' | 'crops' | 'workers' | 'salary' | 'seed-checks';

export function FisheryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const { ponds, loading: pondsLoading } = usePonds();
  const { crops, loading: cropsLoading, addCrop, updateCrop, deleteCrop } = useCrops();
  const { workers, loading: workersLoading, addWorker, updateWorker, deleteWorker } = useWorkers();
  const { payments, loading: paymentsLoading, addPayment, updatePayment, deletePayment } = useSalaryPayments();
  const { seedChecks, loading: seedChecksLoading, addSeedCheck, deleteSeedCheck } = useSeedChecks();

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Ponds Overview', icon: '🏊' },
    { id: 'crops', label: 'Crop Yields', icon: '🐟' },
    { id: 'seed-checks', label: 'Seed Checks', icon: '📏' },
    { id: 'workers', label: 'Workers', icon: '👷' },
    { id: 'salary', label: 'Salary Payments', icon: '💰' },
  ];

  const loading = pondsLoading || cropsLoading || workersLoading || paymentsLoading || seedChecksLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Fishery Management</h1>
        <p className="text-slate-500">Manage ponds, crops, workers, and salaries</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 text-sm md:text-base ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <PondsOverview ponds={ponds} crops={crops} workers={workers} />
            )}
            {activeTab === 'crops' && (
              <CropsTab
                crops={crops}
                ponds={ponds}
                onAdd={addCrop}
                onUpdate={updateCrop}
                onDelete={deleteCrop}
              />
            )}
            {activeTab === 'seed-checks' && (
              <SeedChecksTab
                seedChecks={seedChecks}
                crops={crops}
                onAdd={addSeedCheck}
                onDelete={deleteSeedCheck}
              />
            )}
            {activeTab === 'workers' && (
              <WorkersTab
                workers={workers}
                ponds={ponds}
                onAdd={addWorker}
                onUpdate={updateWorker}
                onDelete={deleteWorker}
              />
            )}
            {activeTab === 'salary' && (
              <SalaryTab
                payments={payments}
                workers={workers}
                onAdd={addPayment}
                onUpdate={updatePayment}
                onDelete={deletePayment}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
