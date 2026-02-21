import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { sendExpenseNotification, getExpenseChanges } from '../lib/notifications';
import type { Expense, ExpenseInsert, ExpenseUpdate } from '../types/database';
import type { DateFilter } from '../types';
import toast from 'react-hot-toast';

export function useExpenses(dateFilter?: DateFilter) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (dateFilter?.startDate) {
        query = query.gte('expense_date', dateFilter.startDate);
      }
      if (dateFilter?.endDate) {
        query = query.lte('expense_date', dateFilter.endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setExpenses((data as Expense[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch expenses';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [dateFilter?.startDate, dateFilter?.endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (expense: ExpenseInsert): Promise<boolean> => {
    try {
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert(expense as never)
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Expense added successfully');
      await fetchExpenses();

      // Send notification to the other partner
      if (data) {
        sendExpenseNotification('created', expense.owner_name as 'Adil' | 'Aejaz', data as Expense);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add expense';
      toast.error(message);
      return false;
    }
  };

  const updateExpense = async (id: string, updates: ExpenseUpdate): Promise<boolean> => {
    try {
      // Get the old expense first for comparison
      const oldExpense = expenses.find((e) => e.id === id);

      const { data, error: updateError } = await supabase
        .from('expenses')
        .update({ ...updates, updated_at: new Date().toISOString() } as never)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Expense updated successfully');
      await fetchExpenses();

      // Send notification with changes
      if (data && oldExpense) {
        const changes = getExpenseChanges(oldExpense, updates);
        if (changes.length > 0) {
          sendExpenseNotification(
            'updated',
            oldExpense.owner_name as 'Adil' | 'Aejaz',
            data as Expense,
            changes
          );
        }
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update expense';
      toast.error(message);
      return false;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      // Get the expense before deleting for notification
      const expenseToDelete = expenses.find((e) => e.id === id);

      const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Expense deleted successfully');
      await fetchExpenses();

      // Send notification about deletion
      if (expenseToDelete) {
        sendExpenseNotification('deleted', expenseToDelete.owner_name as 'Adil' | 'Aejaz', expenseToDelete);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete expense';
      toast.error(message);
      return false;
    }
  };

  return {
    expenses,
    loading,
    error,
    refetch: fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}

export function useExpensesByOwner(ownerName: string, dateFilter?: DateFilter) {
  const { expenses, ...rest } = useExpenses(dateFilter);
  const filteredExpenses = expenses.filter((e) => e.owner_name === ownerName);
  return { expenses: filteredExpenses, allExpenses: expenses, ...rest };
}
