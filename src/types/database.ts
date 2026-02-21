export interface Expense {
  id: string;
  user_id: string;
  owner_name: string;
  amount: number;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInsert {
  id?: string;
  user_id: string;
  owner_name: string;
  amount: number;
  description?: string | null;
  expense_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseUpdate {
  id?: string;
  user_id?: string;
  owner_name?: string;
  amount?: number;
  description?: string | null;
  expense_date?: string;
  created_at?: string;
  updated_at?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Pond types
export interface Pond {
  id: string;
  pond_number: number;
  name: string | null;
  size_acres: number | null;
  location: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

// Crop types
export interface Crop {
  id: string;
  user_id: string;
  pond_id: string;
  seed_type: string;
  seed_count: number;
  seed_onboard_date: string;
  expected_harvest_date: string | null;
  actual_harvest_date: string | null;
  harvest_weight_kg: number | null;
  status: 'active' | 'harvested' | 'failed';
  notes: string | null;
  created_at: string;
  updated_at: string;
  pond?: Pond;
}

export interface CropInsert {
  id?: string;
  user_id: string;
  pond_id: string;
  seed_type: string;
  seed_count: number;
  seed_onboard_date: string;
  expected_harvest_date?: string | null;
  actual_harvest_date?: string | null;
  harvest_weight_kg?: number | null;
  status?: 'active' | 'harvested' | 'failed';
  notes?: string | null;
}

// Seed Check types
export interface SeedCheck {
  id: string;
  user_id: string;
  crop_id: string;
  check_date: string;
  average_size_cm: number | null;
  average_weight_grams: number | null;
  mortality_count: number;
  health_status: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string | null;
  created_at: string;
  crop?: Crop;
}

export interface SeedCheckInsert {
  id?: string;
  user_id: string;
  crop_id: string;
  check_date: string;
  average_size_cm?: number | null;
  average_weight_grams?: number | null;
  mortality_count?: number;
  health_status?: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string | null;
}

// Worker types
export interface Worker {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  role: string;
  assigned_ponds: number[] | null;
  onboard_date: string;
  status: 'active' | 'inactive' | 'terminated';
  monthly_salary: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkerInsert {
  id?: string;
  user_id: string;
  name: string;
  phone?: string | null;
  role?: string;
  assigned_ponds?: number[] | null;
  onboard_date: string;
  status?: 'active' | 'inactive' | 'terminated';
  monthly_salary: number;
  notes?: string | null;
}

// Salary Payment types
export interface SalaryPayment {
  id: string;
  user_id: string;
  worker_id: string;
  payment_month: string;
  amount: number;
  payment_date: string | null;
  status: 'pending' | 'paid' | 'partial';
  notes: string | null;
  created_at: string;
  updated_at: string;
  worker?: Worker;
}

export interface SalaryPaymentInsert {
  id?: string;
  user_id: string;
  worker_id: string;
  payment_month: string;
  amount: number;
  payment_date?: string | null;
  status?: 'pending' | 'paid' | 'partial';
  notes?: string | null;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string | null;
  type: 'seed_check' | 'salary_due' | 'harvest_due' | 'general';
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  due_date: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: Expense;
        Insert: ExpenseInsert;
        Update: ExpenseUpdate;
      };
      ponds: {
        Row: Pond;
        Insert: Partial<Pond>;
        Update: Partial<Pond>;
      };
      crops: {
        Row: Crop;
        Insert: CropInsert;
        Update: Partial<CropInsert>;
      };
      seed_checks: {
        Row: SeedCheck;
        Insert: SeedCheckInsert;
        Update: Partial<SeedCheckInsert>;
      };
      workers: {
        Row: Worker;
        Insert: WorkerInsert;
        Update: Partial<WorkerInsert>;
      };
      salary_payments: {
        Row: SalaryPayment;
        Insert: SalaryPaymentInsert;
        Update: Partial<SalaryPaymentInsert>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
