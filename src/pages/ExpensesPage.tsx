import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseTable } from '../components/ExpenseTable';
import { ExpenseModal } from '../components/ExpenseModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { DateFilter } from '../components/DateFilter';
import { TableSkeleton } from '../components/LoadingSkeleton';
import type { Expense } from '../types/database';
import type { DateFilter as DateFilterType, ExpenseFormData } from '../types';

type TabType = 'Adil' | 'Aejaz';

export function ExpensesPage() {
  const { user, ownerName } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(
    (ownerName as TabType) || 'Adil'
  );
  const [dateFilter, setDateFilter] = useState<DateFilterType>({
    startDate: '',
    endDate: '',
  });

  const { expenses, loading, addExpense, updateExpense, deleteExpense } =
    useExpenses(dateFilter);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => e.owner_name === activeTab),
    [expenses, activeTab]
  );

  const canEdit = ownerName === activeTab;

  const handleAddClick = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const handleModalSubmit = async (data: ExpenseFormData) => {
    if (!user || !ownerName) return;

    setIsSubmitting(true);
    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, {
          amount: parseFloat(data.amount),
          description: data.description || null,
          expense_date: data.expense_date,
        });
      } else {
        await addExpense({
          user_id: user.id,
          owner_name: ownerName,
          amount: parseFloat(data.amount),
          description: data.description || null,
          expense_date: data.expense_date,
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return;

    setIsSubmitting(true);
    try {
      await deleteExpense(selectedExpense.id);
      setIsDeleteModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Partner Expenses</h1>
          <p className="text-slate-500">Manage individual partner expenses</p>
        </div>
        <DateFilter
          filter={dateFilter}
          onChange={setDateFilter}
          onClear={() => setDateFilter({ startDate: '', endDate: '' })}
        />
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200">
        <button
          className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-3 md:px-6 py-3 md:py-4 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'Adil'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white'
          }`}
          onClick={() => setActiveTab('Adil')}
        >
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-base md:text-lg font-bold ${
            activeTab === 'Adil' ? 'bg-white/20' : 'bg-cyan-100 text-cyan-600'
          }`}>
            A
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm md:text-base">Adil</div>
            {ownerName === 'Adil' && (
              <div className="text-xs opacity-70 hidden md:block">Your Account</div>
            )}
          </div>
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-3 md:px-6 py-3 md:py-4 rounded-xl font-medium transition-all duration-300 ${
            activeTab === 'Aejaz'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white'
          }`}
          onClick={() => setActiveTab('Aejaz')}
        >
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-base md:text-lg font-bold ${
            activeTab === 'Aejaz' ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
          }`}>
            A
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm md:text-base">Aejaz</div>
            {ownerName === 'Aejaz' && (
              <div className="text-xs opacity-70 hidden md:block">Your Account</div>
            )}
          </div>
        </button>
      </div>

      {/* Expense Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3">
              {activeTab}'s Expenses
              {!canEdit && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                  View Only
                </span>
              )}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {canEdit ? 'You can add, edit, and delete expenses' : `Viewing ${activeTab}'s expenses (read-only)`}
            </p>
          </div>
          {canEdit && (
            <button 
              onClick={handleAddClick} 
              className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all text-sm md:text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
          )}
        </div>
        <div className="p-4 md:p-6">
          {loading ? (
            <TableSkeleton />
          ) : (
            <ExpenseTable
              expenses={filteredExpenses}
              editable={canEdit}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        expense={selectedExpense}
        isLoading={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        expense={selectedExpense}
        isLoading={isSubmitting}
      />
    </div>
  );
}
