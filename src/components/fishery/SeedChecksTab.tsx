import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import type { SeedCheck, SeedCheckInsert, Crop } from '../../types/database';

interface SeedChecksTabProps {
  seedChecks: SeedCheck[];
  crops: Crop[];
  onAdd: (check: Omit<SeedCheckInsert, 'user_id'>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

interface CheckFormData {
  crop_id: string;
  check_date: string;
  average_size_cm: string;
  average_weight_grams: string;
  mortality_count: string;
  health_status: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

const initialFormData: CheckFormData = {
  crop_id: '',
  check_date: new Date().toISOString().split('T')[0],
  average_size_cm: '',
  average_weight_grams: '',
  mortality_count: '0',
  health_status: 'good',
  notes: '',
};

export function SeedChecksTab({ seedChecks, crops, onAdd, onDelete }: SeedChecksTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CheckFormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const activeCrops = crops.filter((c) => c.status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const checkData: Omit<SeedCheckInsert, 'user_id'> = {
      crop_id: formData.crop_id,
      check_date: formData.check_date,
      average_size_cm: formData.average_size_cm ? parseFloat(formData.average_size_cm) : null,
      average_weight_grams: formData.average_weight_grams ? parseFloat(formData.average_weight_grams) : null,
      mortality_count: parseInt(formData.mortality_count) || 0,
      health_status: formData.health_status,
      notes: formData.notes || null,
    };

    const success = await onAdd(checkData);

    if (success) {
      setShowModal(false);
      setFormData(initialFormData);
    }
    setLoading(false);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-700';
      case 'good':
        return 'bg-cyan-100 text-cyan-700';
      case 'fair':
        return 'bg-amber-100 text-amber-700';
      case 'poor':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  const getDaysSinceOnboard = (crop: Crop) => {
    return differenceInDays(new Date(), new Date(crop.seed_onboard_date));
  };

  // Group checks by crop
  const checksByCrop = activeCrops.map((crop) => ({
    crop,
    checks: seedChecks.filter((c) => c.crop_id === crop.id),
    daysSinceOnboard: getDaysSinceOnboard(crop),
    needsCheck: getDaysSinceOnboard(crop) >= 30 && 
      !seedChecks.some((c) => 
        c.crop_id === crop.id && 
        differenceInDays(new Date(), new Date(c.check_date)) < 30
      ),
  }));

  return (
    <div className="p-4 md:p-6">
      {/* Reminders */}
      {checksByCrop.some((c) => c.needsCheck) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <h4 className="text-amber-700 font-semibold">Seed Check Reminders</h4>
          </div>
          <div className="space-y-2">
            {checksByCrop
              .filter((c) => c.needsCheck)
              .map(({ crop }) => (
                <div key={crop.id} className="flex items-center justify-between">
                  <span className="text-slate-600">
                    Pond {crop.pond?.pond_number} - {crop.seed_type} ({getDaysSinceOnboard(crop)} days old)
                  </span>
                  <button
                    onClick={() => {
                      setFormData({ ...initialFormData, crop_id: crop.id });
                      setShowModal(true);
                    }}
                    className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-all"
                  >
                    Add Check
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Seed Size Checks</h3>
          <p className="text-slate-500 text-sm">Track seed growth monthly</p>
        </div>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          + Add Check
        </button>
      </div>

      {/* Checks by Crop */}
      {activeCrops.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No active crops. Add a crop first to start tracking seed checks.
        </div>
      ) : (
        <div className="space-y-6">
          {checksByCrop.map(({ crop, checks, daysSinceOnboard }) => (
            <div key={crop.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🐟</span>
                  <div>
                    <h4 className="text-slate-800 font-medium">
                      Pond {crop.pond?.pond_number} - {crop.seed_type}
                    </h4>
                    <p className="text-slate-500 text-sm">
                      {crop.seed_count.toLocaleString()} seeds • {daysSinceOnboard} days old
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormData({ ...initialFormData, crop_id: crop.id });
                    setShowModal(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-all"
                >
                  + Add Check
                </button>
              </div>

              {checks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No checks recorded yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-500 font-medium text-sm">Date</th>
                        <th className="text-right py-3 px-4 text-slate-500 font-medium text-sm">Size (cm)</th>
                        <th className="text-right py-3 px-4 text-slate-500 font-medium text-sm">Weight (g)</th>
                        <th className="text-right py-3 px-4 text-slate-500 font-medium text-sm">Mortality</th>
                        <th className="text-center py-3 px-4 text-slate-500 font-medium text-sm">Health</th>
                        <th className="text-right py-3 px-4 text-slate-500 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checks.map((check) => (
                        <tr key={check.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-800">
                            {format(new Date(check.check_date), 'dd MMM yyyy')}
                          </td>
                          <td className="py-3 px-4 text-right text-cyan-600">
                            {check.average_size_cm ? `${check.average_size_cm} cm` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-emerald-600">
                            {check.average_weight_grams ? `${check.average_weight_grams} g` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-red-600">
                            {check.mortality_count || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(check.health_status)}`}>
                              {check.health_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onDelete(check.id)}
                              className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-all"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">Record Seed Check</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1">Crop</label>
                <select
                  value={formData.crop_id}
                  onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none"
                  required
                >
                  <option value="">Select Crop</option>
                  {activeCrops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      Pond {crop.pond?.pond_number} - {crop.seed_type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Check Date</label>
                <input
                  type="date"
                  value={formData.check_date}
                  onChange={(e) => setFormData({ ...formData, check_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-sm mb-1">Avg Size (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.average_size_cm}
                    onChange={(e) => setFormData({ ...formData, average_size_cm: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g., 5.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-sm mb-1">Avg Weight (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.average_weight_grams}
                    onChange={(e) => setFormData({ ...formData, average_weight_grams: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g., 50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-sm mb-1">Mortality Count</label>
                  <input
                    type="number"
                    value={formData.mortality_count}
                    onChange={(e) => setFormData({ ...formData, mortality_count: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-sm mb-1">Health Status</label>
                  <select
                    value={formData.health_status}
                    onChange={(e) => setFormData({ ...formData, health_status: e.target.value as CheckFormData['health_status'] })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-cyan-500 focus:outline-none resize-none"
                  rows={2}
                  placeholder="Optional observations..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Record Check'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
