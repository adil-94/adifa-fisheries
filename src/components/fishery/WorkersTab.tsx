import { useState } from 'react';
import { format } from 'date-fns';
import type { Worker, WorkerInsert, Pond } from '../../types/database';

interface WorkersTabProps {
  workers: Worker[];
  ponds: Pond[];
  onAdd: (worker: Omit<WorkerInsert, 'user_id'>) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<WorkerInsert>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

interface WorkerFormData {
  name: string;
  phone: string;
  role: string;
  assigned_ponds: number[];
  onboard_date: string;
  monthly_salary: string;
  notes: string;
}

const initialFormData: WorkerFormData = {
  name: '',
  phone: '',
  role: 'caretaker',
  assigned_ponds: [],
  onboard_date: new Date().toISOString().split('T')[0],
  monthly_salary: '',
  notes: '',
};

export function WorkersTab({ workers, ponds, onAdd, onUpdate, onDelete }: WorkersTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState<WorkerFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredWorkers = workers.filter((w) => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const workerData: Omit<WorkerInsert, 'user_id'> = {
      name: formData.name,
      phone: formData.phone || null,
      role: formData.role,
      assigned_ponds: formData.assigned_ponds.length > 0 ? formData.assigned_ponds : null,
      onboard_date: formData.onboard_date,
      monthly_salary: parseFloat(formData.monthly_salary),
      notes: formData.notes || null,
    };

    let success: boolean;
    if (editingWorker) {
      success = await onUpdate(editingWorker.id, workerData);
    } else {
      success = await onAdd(workerData);
    }

    if (success) {
      setShowModal(false);
      setEditingWorker(null);
      setFormData(initialFormData);
    }
    setLoading(false);
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone || '',
      role: worker.role,
      assigned_ponds: worker.assigned_ponds || [],
      onboard_date: worker.onboard_date,
      monthly_salary: worker.monthly_salary.toString(),
      notes: worker.notes || '',
    });
    setShowModal(true);
  };

  const togglePond = (pondNumber: number) => {
    setFormData((prev) => ({
      ...prev,
      assigned_ponds: prev.assigned_ponds.includes(pondNumber)
        ? prev.assigned_ponds.filter((p) => p !== pondNumber)
        : [...prev.assigned_ponds, pondNumber],
    }));
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingWorker(null);
            setFormData(initialFormData);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          + Add Worker
        </button>
      </div>

      {/* Workers List */}
      {filteredWorkers.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No workers found. Add your first worker to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className={`rounded-xl border p-4 shadow-sm ${
                worker.status === 'active'
                  ? 'bg-white border-purple-200'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {worker.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{worker.name}</h4>
                  <p className="text-slate-500 text-sm">{worker.role}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    worker.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {worker.status}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {worker.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">📞 Phone:</span>
                    <span className="text-slate-800">{worker.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">💰 Salary:</span>
                  <span className="text-emerald-600 font-medium">
                    {formatCurrency(Number(worker.monthly_salary))}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">📅 Onboarded:</span>
                  <span className="text-slate-800">{format(new Date(worker.onboard_date), 'dd MMM yyyy')}</span>
                </div>
                {worker.assigned_ponds && worker.assigned_ponds.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">🏊 Ponds:</span>
                    <span className="text-slate-800">{worker.assigned_ponds.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleEdit(worker)}
                  className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    onUpdate(worker.id, {
                      status: worker.status === 'active' ? 'inactive' : 'active',
                    })
                  }
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    worker.status === 'active'
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {worker.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => onDelete(worker.id)}
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
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                {editingWorker ? 'Edit Worker' : 'Add New Worker'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none"
                  placeholder="Worker name"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none"
                >
                  <option value="caretaker">Caretaker</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="feeder">Feeder</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={formData.monthly_salary}
                  onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none"
                  placeholder="Monthly salary"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Onboard Date</label>
                <input
                  type="date"
                  value={formData.onboard_date}
                  onChange={(e) => setFormData({ ...formData, onboard_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-2">Assigned Ponds</label>
                <div className="flex flex-wrap gap-2">
                  {ponds.map((pond) => (
                    <button
                      key={pond.id}
                      type="button"
                      onClick={() => togglePond(pond.pond_number)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        formData.assigned_ponds.includes(pond.pond_number)
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Pond {pond.pond_number}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none resize-none"
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
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingWorker ? 'Update' : 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
