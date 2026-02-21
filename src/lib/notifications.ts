import { supabase } from './supabase';
import type { Expense } from '../types/database';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface ExpenseChange {
  field: string;
  oldValue: string | number;
  newValue: string | number;
}

export async function sendExpenseNotification(
  action: 'created' | 'updated' | 'deleted',
  actor: 'Adil' | 'Aejaz',
  expense: Partial<Expense>,
  changes?: ExpenseChange[]
) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/notify-expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        action,
        actor,
        expense: {
          id: expense.id,
          amount: expense.amount,
          description: expense.description,
          expense_date: expense.expense_date,
          owner_name: expense.owner_name,
        },
        changes,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export function getExpenseChanges(
  oldExpense: Expense,
  newExpense: Partial<Expense>
): ExpenseChange[] {
  const changes: ExpenseChange[] = [];

  if (newExpense.amount !== undefined && Number(oldExpense.amount) !== Number(newExpense.amount)) {
    changes.push({
      field: 'Amount',
      oldValue: `₹${Number(oldExpense.amount).toLocaleString('en-IN')}`,
      newValue: `₹${Number(newExpense.amount).toLocaleString('en-IN')}`,
    });
  }

  if (newExpense.description !== undefined && oldExpense.description !== newExpense.description) {
    changes.push({
      field: 'Description',
      oldValue: oldExpense.description || '(empty)',
      newValue: newExpense.description || '(empty)',
    });
  }

  if (newExpense.expense_date !== undefined && oldExpense.expense_date !== newExpense.expense_date) {
    changes.push({
      field: 'Date',
      oldValue: new Date(oldExpense.expense_date).toLocaleDateString('en-IN'),
      newValue: new Date(newExpense.expense_date).toLocaleDateString('en-IN'),
    });
  }

  return changes;
}
