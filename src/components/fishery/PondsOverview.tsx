import { format, differenceInDays } from 'date-fns';
import type { Pond, Crop, Worker } from '../../types/database';

interface PondsOverviewProps {
  ponds: Pond[];
  crops: Crop[];
  workers: Worker[];
}

export function PondsOverview({ ponds, crops, workers }: PondsOverviewProps) {
  const getActiveCropForPond = (pondId: string) => {
    return crops.find((c) => c.pond_id === pondId && c.status === 'active');
  };

  const getWorkersForPond = (pondNumber: number) => {
    return workers.filter(
      (w) => w.status === 'active' && w.assigned_ponds?.includes(pondNumber)
    );
  };

  const getDaysSinceOnboard = (date: string) => {
    return differenceInDays(new Date(), new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Summary stats
  const activeCrops = crops.filter((c) => c.status === 'active');
  const totalSeeds = activeCrops.reduce((sum, c) => sum + c.seed_count, 0);
  const activeWorkers = workers.filter((w) => w.status === 'active');
  const totalMonthlySalary = activeWorkers.reduce((sum, w) => sum + Number(w.monthly_salary), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 md:p-4">
          <p className="text-emerald-600 text-xs md:text-sm">Active Ponds</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-700">{ponds.filter((p) => p.status === 'active').length}</p>
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 md:p-4">
          <p className="text-cyan-600 text-xs md:text-sm">Active Crops</p>
          <p className="text-xl md:text-2xl font-bold text-cyan-700">{activeCrops.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 md:p-4">
          <p className="text-purple-600 text-xs md:text-sm">Total Seeds</p>
          <p className="text-xl md:text-2xl font-bold text-purple-700">{totalSeeds.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4">
          <p className="text-amber-600 text-xs md:text-sm">Monthly Salary</p>
          <p className="text-xl md:text-2xl font-bold text-amber-700">{formatCurrency(totalMonthlySalary)}</p>
        </div>
      </div>

      {/* Ponds Grid */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Pond Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ponds.map((pond) => {
            const activeCrop = getActiveCropForPond(pond.id);
            const pondWorkers = getWorkersForPond(pond.pond_number);

            return (
              <div
                key={pond.id}
                className={`rounded-xl border p-4 transition-all ${
                  pond.status === 'active'
                    ? 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'
                    : pond.status === 'maintenance'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏊</span>
                    <h4 className="text-lg font-semibold text-slate-800">
                      Pond {pond.pond_number}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pond.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : pond.status === 'maintenance'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {pond.status}
                  </span>
                </div>

                {activeCrop ? (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">🐟 Seed Type:</span>
                      <span className="text-slate-800">{activeCrop.seed_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">📊 Count:</span>
                      <span className="text-slate-800">{activeCrop.seed_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">📅 Onboarded:</span>
                      <span className="text-slate-800">
                        {format(new Date(activeCrop.seed_onboard_date), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">⏱️ Age:</span>
                      <span className="text-cyan-600 font-medium">
                        {getDaysSinceOnboard(activeCrop.seed_onboard_date)} days
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-slate-400 text-sm">
                    No active crop
                  </div>
                )}

                {pondWorkers.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-slate-500 text-xs mb-2">Assigned Workers:</p>
                    <div className="flex flex-wrap gap-1">
                      {pondWorkers.map((worker) => (
                        <span
                          key={worker.id}
                          className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600"
                        >
                          {worker.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Workers */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Workers</h3>
        {activeWorkers.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No active workers</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWorkers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-medium">{worker.name}</h4>
                    <p className="text-slate-500 text-sm">{worker.role}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Salary:</span>
                    <span className="text-emerald-600 font-medium">{formatCurrency(Number(worker.monthly_salary))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Onboarded:</span>
                    <span className="text-slate-700">{format(new Date(worker.onboard_date), 'dd MMM yyyy')}</span>
                  </div>
                  {worker.assigned_ponds && worker.assigned_ponds.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ponds:</span>
                      <span className="text-slate-700">{worker.assigned_ponds.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
