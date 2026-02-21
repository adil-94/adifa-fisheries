import type { Expense } from '../types/database';
import { formatCurrency, formatDate } from '../utils/format';
import { EmptyState } from './EmptyState';

interface ExpenseTableProps {
  expenses: Expense[];
  editable?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  showOwner?: boolean;
}

export function ExpenseTable({
  expenses,
  editable = false,
  onEdit,
  onDelete,
  showOwner = false,
}: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses found"
        description="There are no expenses to display for the selected criteria."
      />
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-emerald-600 font-bold text-lg">
                  {formatCurrency(expense.amount)}
                </p>
                <p className="text-slate-500 text-sm">{formatDate(expense.expense_date)}</p>
              </div>
              {showOwner && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    expense.owner_name === 'Adil'
                      ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${expense.owner_name === 'Adil' ? 'bg-cyan-500' : 'bg-purple-500'}`}></span>
                  {expense.owner_name}
                </span>
              )}
            </div>
            {expense.description && (
              <p className="text-slate-600 text-sm mb-3 line-clamp-2">{expense.description}</p>
            )}
            {editable && (
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onEdit?.(expense)}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => onDelete?.(expense)}
                  className="py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-4 px-4 text-slate-500 text-sm font-medium uppercase tracking-wider">Date</th>
              {showOwner && <th className="text-left py-4 px-4 text-slate-500 text-sm font-medium uppercase tracking-wider">Owner</th>}
              <th className="text-left py-4 px-4 text-slate-500 text-sm font-medium uppercase tracking-wider">Amount</th>
              <th className="text-left py-4 px-4 text-slate-500 text-sm font-medium uppercase tracking-wider">Description</th>
              {editable && <th className="text-right py-4 px-4 text-slate-500 text-sm font-medium uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr 
                key={expense.id} 
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                }`}
              >
                <td className="py-4 px-4 text-slate-800 font-medium">{formatDate(expense.expense_date)}</td>
                {showOwner && (
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        expense.owner_name === 'Adil'
                          ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                          : 'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${expense.owner_name === 'Adil' ? 'bg-cyan-500' : 'bg-purple-500'}`}></span>
                      {expense.owner_name}
                    </span>
                  </td>
                )}
                <td className="py-4 px-4">
                  <span className="text-emerald-600 font-bold">
                    {formatCurrency(expense.amount)}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-600 max-w-xs truncate">{expense.description || '-'}</td>
                {editable && (
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit?.(expense)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete?.(expense)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
