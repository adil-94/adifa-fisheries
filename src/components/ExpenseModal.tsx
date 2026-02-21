import { useState, useEffect } from 'react';
import type { Expense } from '../types/database';
import type { ExpenseFormData } from '../types';
import { getTodayDate } from '../utils/format';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  expense?: Expense | null;
  isLoading?: boolean;
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  expense,
  isLoading = false,
}: ExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    description: '',
    expense_date: getTodayDate(),
  });
  const [errors, setErrors] = useState<Partial<ExpenseFormData>>({});

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description || '',
        expense_date: expense.expense_date,
      });
    } else {
      setFormData({
        amount: '',
        description: '',
        expense_date: getTodayDate(),
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<ExpenseFormData> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.expense_date) {
      newErrors.expense_date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">
          {expense ? 'Edit Expense' : 'Add New Expense'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Field */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-2">
              Amount (INR) *
            </label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border ${errors.amount ? 'border-red-400' : 'border-slate-200'} focus-within:border-cyan-500 transition-colors`}>
              <span className="text-slate-400">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="flex-1 bg-transparent text-slate-800 text-lg outline-none"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            {errors.amount && (
              <p className="mt-2 text-red-500 text-sm">{errors.amount}</p>
            )}
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-2">
              Date *
            </label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border ${errors.expense_date ? 'border-red-400' : 'border-slate-200'} focus-within:border-cyan-500 transition-colors`}>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                className="flex-1 bg-transparent text-slate-800 outline-none"
                value={formData.expense_date}
                onChange={(e) =>
                  setFormData({ ...formData, expense_date: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            {errors.expense_date && (
              <p className="mt-2 text-red-500 text-sm">{errors.expense_date}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-slate-600 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter description (optional)"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-500 transition-colors resize-none"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              className="flex-1 px-5 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-medium hover:bg-slate-200 transition-all"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : expense ? (
                'Update'
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
