import type { DateFilter as DateFilterType } from '../types';

interface DateFilterProps {
  filter: DateFilterType;
  onChange: (filter: DateFilterType) => void;
  onClear: () => void;
}

export function DateFilter({ filter, onChange, onClear }: DateFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3 items-center">
      <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          type="date"
          className="bg-transparent text-slate-700 text-sm outline-none w-28 md:w-32"
          value={filter.startDate}
          onChange={(e) => onChange({ ...filter, startDate: e.target.value })}
          placeholder="From"
        />
      </div>
      <span className="text-slate-300">→</span>
      <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          type="date"
          className="bg-transparent text-slate-700 text-sm outline-none w-28 md:w-32"
          value={filter.endDate}
          onChange={(e) => onChange({ ...filter, endDate: e.target.value })}
          placeholder="To"
        />
      </div>
      {(filter.startDate || filter.endDate) && (
        <button 
          onClick={onClear} 
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
          title="Clear filters"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
