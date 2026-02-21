import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import type { Expense } from '../types/database';

interface ExpenseChartsProps {
  expenses: Expense[];
}

const COLORS = {
  adil: '#06b6d4',
  aejaz: '#d946ef',
  total: '#f59e0b',
};

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  // Pie chart data - expenses by owner
  const pieData = useMemo(() => {
    const adilTotal = expenses
      .filter((e) => e.owner_name === 'Adil')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const aejazTotal = expenses
      .filter((e) => e.owner_name === 'Aejaz')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return [
      { name: 'Adil', value: adilTotal, color: COLORS.adil },
      { name: 'Aejaz', value: aejazTotal, color: COLORS.aejaz },
    ].filter((d) => d.value > 0);
  }, [expenses]);

  // Bar chart data - monthly expenses
  const barData = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfMonth(now),
    });

    return months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthExpenses = expenses.filter((e) => {
        const date = parseISO(e.expense_date);
        return date >= monthStart && date <= monthEnd;
      });

      const adilTotal = monthExpenses
        .filter((e) => e.owner_name === 'Adil')
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const aejazTotal = monthExpenses
        .filter((e) => e.owner_name === 'Aejaz')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        month: format(month, 'MMM yyyy'),
        Adil: adilTotal,
        Aejaz: aejazTotal,
        Total: adilTotal + aejazTotal,
      };
    });
  }, [expenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="text-slate-500 text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          <p className="text-sm font-medium" style={{ color: data.payload.color }}>
            {data.name}: {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Pie Chart - Expense Distribution */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-3 md:mb-4">Expense Distribution</h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 md:gap-6 mt-3 md:mt-4">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 text-xs md:text-sm">{entry.name}: {formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart - Monthly Expenses */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-3 md:mb-4">Monthly Expenses</h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-600 text-xs md:text-sm">{value}</span>}
              />
              <Bar dataKey="Adil" fill={COLORS.adil} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Aejaz" fill={COLORS.aejaz} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
