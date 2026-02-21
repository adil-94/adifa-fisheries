import { useState } from 'react';
import { format } from 'date-fns';
import type { SalaryPayment, SalaryPaymentInsert, Worker } from '../../types/database';

interface SalaryTabProps {
  payments: SalaryPayment[];
  workers: Worker[];
  onAdd: (payment: Omit<SalaryPaymentInsert, 'user_id'>) => Promise<boolean>;
  onUpdate: (id: string, updates: Partial<SalaryPaymentInsert>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

interface PaymentFormData {
  worker_id: string;
  payment_month: string;
  amount: string;
  payment_date: string;
  status: 'pending' | 'paid' | 'partial';
  notes: string;
}

const initialFormData: PaymentFormData = {
  worker_id: '',
  payment_month: new Date().toISOString().slice(0, 7) + '-01',
  amount: '',
  payment_date: new Date().toISOString().split('T')[0],
  status: 'pending',
  notes: '',
};

export function SalaryTab({ payments, workers, onAdd, onUpdate, onDelete }: SalaryTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SalaryPayment | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const activeWorkers = workers.filter((w) => w.status === 'active');

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
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

    const paymentData: Omit<SalaryPaymentInsert, 'user_id'> = {
      worker_id: formData.worker_id,
      payment_month: formData.payment_month,
      amount: parseFloat(formData.amount),
      payment_date: formData.status === 'paid' ? formData.payment_date : null,
      status: formData.status,
      notes: formData.notes || null,
    };

    let success: boolean;
    if (editingPayment) {
      success = await onUpdate(editingPayment.id, paymentData);
    } else {
      success = await onAdd(paymentData);
    }

    if (success) {
      setShowModal(false);
      setEditingPayment(null);
      setFormData(initialFormData);
    }
    setLoading(false);
  };

  const handleEdit = (payment: SalaryPayment) => {
    setEditingPayment(payment);
    setFormData({
      worker_id: payment.worker_id,
      payment_month: payment.payment_month,
      amount: payment.amount.toString(),
      payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
      status: payment.status,
      notes: payment.notes || '',
    });
    setShowModal(true);
  };

  const handleMarkPaid = async (payment: SalaryPayment) => {
    await onUpdate(payment.id, {
      status: 'paid',
      payment_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleAddForWorker = (worker: Worker) => {
    setEditingPayment(null);
    setFormData({
      ...initialFormData,
      worker_id: worker.id,
      amount: worker.monthly_salary.toString(),
    });
    setShowModal(true);
  };

  // Summary
  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="p-4 md:p-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4">
          <p className="text-amber-600 text-xs md:text-sm">Pending Payments</p>
          <p className="text-xl md:text-2xl font-bold text-amber-700">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 md:p-4">
          <p className="text-emerald-600 text-xs md:text-sm">Total Paid</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {/* Quick Add for Workers */}
      {activeWorkers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-slate-500 text-sm mb-2">Quick Add Payment:</h4>
          <div className="flex flex-wrap gap-2">
            {activeWorkers.map((worker) => (
              <button
                key={worker.id}
                onClick={() => handleAddForWorker(worker)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {worker.name.charAt(0)}
                </span>
                {worker.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'pending', 'paid'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingPayment(null);
            setFormData(initialFormData);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          + Add Payment
        </button>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No payments found. Add salary payments to track worker salaries.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-sm">Worker</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium text-sm">Month</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium text-sm">Amount</th>
                <th className="text-center py-3 px-4 text-slate-500 font-medium text-sm">Status</th>
                <th className="text-right py-3 px-4 text-slate-500 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {payment.worker?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-slate-800">{payment.worker?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    {format(new Date(payment.payment_month), 'MMM yyyy')}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                    {formatCurrency(Number(payment.amount))}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : payment.status === 'partial'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      {payment.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(payment)}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs hover:bg-emerald-200 transition-all"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(payment)}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(payment.id)}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                {editingPayment ? 'Edit Payment' : 'Add Salary Payment'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-600 text-sm mb-1">Worker</label>
                <select
                  value={formData.worker_id}
                  onChange={(e) => {
                    const worker = workers.find((w) => w.id === e.target.value);
                    setFormData({
                      ...formData,
                      worker_id: e.target.value,
                      amount: worker?.monthly_salary.toString() || formData.amount,
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-amber-500 focus:outline-none"
                  required
                >
                  <option value="">Select Worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} ({formatCurrency(Number(worker.monthly_salary))}/mo)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Payment Month</label>
                <input
                  type="month"
                  value={formData.payment_month.slice(0, 7)}
                  onChange={(e) => setFormData({ ...formData, payment_month: e.target.value + '-01' })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-amber-500 focus:outline-none"
                  placeholder="Payment amount"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentFormData['status'] })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-amber-500 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
              {formData.status === 'paid' && (
                <div>
                  <label className="block text-slate-600 text-sm mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-600 text-sm mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-amber-500 focus:outline-none resize-none"
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
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingPayment ? 'Update' : 'Add Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
