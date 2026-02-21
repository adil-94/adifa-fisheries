import type { Expense } from '../types/database';
import { formatCurrency, formatDate } from '../utils/format';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  expense: Expense | null;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  expense,
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md backdrop-blur-xl bg-slate-800/90 border border-white/20 rounded-2xl shadow-2xl p-6">
        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-white text-center mb-2">Delete Expense</h3>
        <p className="text-white/60 text-center mb-6">
          Are you sure you want to delete this expense?
        </p>
        
        {/* Expense Details */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-white/50">Date</span>
            <span className="text-white font-medium">{formatDate(expense.expense_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Amount</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(expense.amount)}</span>
          </div>
          {expense.description && (
            <div className="flex justify-between">
              <span className="text-white/50">Description</span>
              <span className="text-white/70 text-right max-w-[200px] truncate">{expense.description}</span>
            </div>
          )}
        </div>
        
        <p className="text-center text-white/40 text-sm mb-6">
          This action cannot be undone.
        </p>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
