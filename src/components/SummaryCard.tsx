import { formatCurrency } from '../utils/format';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: string;
  gradient: string;
  glowColor: string;
}

export function SummaryCard({ title, amount, icon, gradient, glowColor }: SummaryCardProps) {
  return (
    <div className={`relative group overflow-hidden rounded-2xl ${gradient} p-[1px]`}>
      <div className={`absolute inset-0 ${gradient} opacity-30 blur-xl group-hover:opacity-50 transition-opacity`}></div>
      <div className="relative bg-white rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <p className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${gradient.replace('bg-gradient-to-r', '')} bg-clip-text text-transparent`}>
              {formatCurrency(amount)}
            </p>
          </div>
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${gradient} flex items-center justify-center text-xl md:text-2xl shadow-lg ${glowColor}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
