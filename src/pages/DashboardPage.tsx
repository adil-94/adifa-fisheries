import { useState, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { SummaryCard } from '../components/SummaryCard';
import { ExpenseTable } from '../components/ExpenseTable';
import { DateFilter } from '../components/DateFilter';
import { ExpenseCharts } from '../components/ExpenseCharts';
import { PageSkeleton } from '../components/LoadingSkeleton';
import type { DateFilter as DateFilterType } from '../types';

export function DashboardPage() {
  // Default to all time (empty dates)
  const [dateFilter, setDateFilter] = useState<DateFilterType>({
    startDate: '',
    endDate: '',
  });

  const { expenses, loading } = useExpenses(dateFilter);

  const summary = useMemo(() => {
    const adilTotal = expenses
      .filter((e) => e.owner_name === 'Adil')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const aejazTotal = expenses
      .filter((e) => e.owner_name === 'Aejaz')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      adilTotal,
      aejazTotal,
      grandTotal: adilTotal + aejazTotal,
    };
  }, [expenses]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Dashboard</h1>
          <p className="text-slate-500">Overview of all business expenses</p>
        </div>
        <DateFilter
          filter={dateFilter}
          onChange={setDateFilter}
          onClear={() => setDateFilter({ startDate: '', endDate: '' })}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Adil's Expenses"
          amount={summary.adilTotal}
          icon="👤"
          gradient="bg-gradient-to-r from-cyan-500 to-blue-500"
          glowColor="shadow-cyan-500/30"
        />
        <SummaryCard
          title="Aejaz's Expenses"
          amount={summary.aejazTotal}
          icon="👤"
          gradient="bg-gradient-to-r from-purple-500 to-pink-500"
          glowColor="shadow-purple-500/30"
        />
        <SummaryCard
          title="Grand Total"
          amount={summary.grandTotal}
          icon="💰"
          gradient="bg-gradient-to-r from-amber-500 to-orange-500"
          glowColor="shadow-amber-500/30"
        />
      </div>

      {/* Expense Charts */}
      <ExpenseCharts expenses={expenses} />

      {/* Combined Expenses Table (Read-Only) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 border-b border-slate-200">
          <h2 className="text-lg md:text-xl font-bold text-slate-800">All Expenses</h2>
          <p className="text-slate-500 text-sm mt-1">Combined view of both partners' expenses</p>
        </div>
        <div className="p-4 md:p-6">
          <ExpenseTable expenses={expenses} showOwner editable={false} />
        </div>
      </div>
    </div>
  );
}
