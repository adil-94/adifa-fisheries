import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import type { Crop, CropInsert, Pond } from '../../types/database';

interface CropsTabProps {
  crops: Crop[];
  ponds: Pond[];
  onAdd: (crop: Omit<CropInsert, 'user_id'>) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<CropInsert>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

interface CropFormData {
  pond_id: string;
  seed_type: string;
  seed_count: string;
  seed_onboard_date: string;
  expected_harvest_date: string;
  notes: string;
}

const initialFormData: CropFormData = {
  pond_id: '',
  seed_type: '',
  seed_count: '',
  seed_onboard_date: new Date().toISOString().split('T')[0],
  expected_harvest_date: '',
  notes: '',
};

export function CropsTab({ crops, ponds, onAdd, onUpdate, onDelete }: CropsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [formData, setFormData] = useState<CropFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'harvested'>('all');

  const filteredCrops = crops.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cropData: Omit<CropInsert, 'user_id'> = {
      pond_id: formData.pond_id,
      seed_type: formData.seed_type,
      seed_count: parseInt(formData.seed_count),
      seed_onboard_date: formData.seed_onboard_date,
      expected_harvest_date: formData.expected_harvest_date || null,
      notes: formData.notes || null,
    };

    let success: boolean;
    if (editingCrop) {
      success = await onUpdate(editingCrop.id, cropData);
    } else {
      success = await onAdd(cropData);
    }

    if (success) {
      setShowModal(false);
      setEditingCrop(null);
      setFormData(initialFormData);
    }
    setLoading(false);
  };

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setFormData({
      pond_id: crop.pond_id,
      seed_type: crop.seed_type,
      seed_count: crop.seed_count.toString(),
      seed_onboard_date: crop.seed_onboard_date,
      expected_harvest_date: crop.expected_harvest_date || '',
      notes: crop.notes || '',
    });
    setShowModal(true);
  };

  const handleHarvest = async (crop: Crop) => {
    const weight = prompt('Enter harvest weight in kg:');
    if (weight) {
      await onUpdate(crop.id, {
        status: 'harvested',
        actual_harvest_date: new Date().toISOString().split('T')[0],
        harvest_weight_kg: parseFloat(weight),
      });
    }
  };

  const getDaysSinceOnboard = (date: string) => {
    return differenceInDays(new Date(), new Date(date));
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'active', 'harvested'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingCrop(null);
            setFormData(initialFormData);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
        >
          + Add Crop
        </button>
      </div>

      {/* Crops List */}
      {filteredCrops.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No crops found. Add your first crop to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              className={`rounded-xl border p-4 shadow-sm ${
                crop.status === 'active'
                  ? 'bg-white border-emerald-200'
                  : crop.status === 'harvested'
                  ? 'bg-white border-cyan-200'
                  : 'bg-white border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐟</span>
                  <h4 className="font-semibold text-slate-800">{crop.seed_type}</h4>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    crop.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : crop.status === 'harvested'
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {crop.status}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pond:</span>
                  <span className="text-slate-800">Pond {crop.pond?.pond_number || '?'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seed Count:</span>
                  <span className="text-slate-800">{crop.seed_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Onboarded:</span>
                  <span className="text-slate-800">{format(new Date(crop.seed_onboard_date), 'dd MMM yyyy')}</span>
                </div>
                {crop.status === 'active' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Age:</span>
                    <span className="text-cyan-600 font-medium">
                      {getDaysSinceOnboard(crop.seed_onboard_date)} days
                    </span>
                  </div>
                )}
                {crop.status === 'harvested' && crop.harvest_weight_kg && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Harvest Weight:</span>
                    <span className="text-emerald-600 font-medium">{crop.harvest_weight_kg} kg</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                {crop.status === 'active' && (
                  <button
                    onClick={() => handleHarvest(crop)}
                    className="flex-1 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg text-sm hover:bg-cyan-200 transition-all"
                  >
                    Harvest
                  </button>
                )}
                <button
                  onClick={() => handleEdit(crop)}
                  className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(crop.id)}
                  className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                {editingCrop ? 'Edit Crop' : 'Add New Crop'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1">Pond</label>
                <select
                  value={formData.pond_id}
                  onChange={(e) => setFormData({ ...formData, pond_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-emerald-500 focus:outline-none"
                  required
                >
                  <option value="">Select Pond</option>
                  {ponds.map((pond) => (
                    <option key={pond.id} value={pond.id}>
                      Pond {pond.pond_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Seed Type</label>
                <input
                  type="text"
                  value={formData.seed_type}
                  onChange={(e) => setFormData({ ...formData, seed_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g., Rohu, Catla, Tilapia"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Seed Count</label>
                <input
                  type="number"
                  value={formData.seed_count}
                  onChange={(e) => setFormData({ ...formData, seed_count: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-emerald-500 focus:outline-none"
                  placeholder="Number of seeds"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Onboard Date</label>
                <input
                  type="date"
                  value={formData.seed_onboard_date}
                  onChange={(e) => setFormData({ ...formData, seed_onboard_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Expected Harvest Date</label>
                <input
                  type="date"
                  value={formData.expected_harvest_date}
                  onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-emerald-500 focus:outline-none resize-none"
                  rows={2}
                  placeholder="Optional notes..."
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
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCrop ? 'Update' : 'Add Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
