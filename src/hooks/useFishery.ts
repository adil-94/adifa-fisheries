import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Pond, Crop, CropInsert, SeedCheck, SeedCheckInsert, Worker, WorkerInsert, SalaryPayment, SalaryPaymentInsert, Notification } from '../types/database';
import toast from 'react-hot-toast';

// Ponds Hook
export function usePonds() {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPonds = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ponds')
      .select('*')
      .order('pond_number', { ascending: true });

    if (error) {
      toast.error('Failed to fetch ponds');
      console.error(error);
    } else {
      setPonds(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPonds();
  }, [fetchPonds]);

  return { ponds, loading, refetch: fetchPonds };
}

// Crops Hook
export function useCrops() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCrops = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('crops')
      .select('*, pond:ponds(*)')
      .order('seed_onboard_date', { ascending: false });

    if (error) {
      toast.error('Failed to fetch crops');
      console.error(error);
    } else {
      setCrops(data || []);
    }
    setLoading(false);
  }, []);

  const addCrop = async (crop: Omit<CropInsert, 'user_id'>) => {
    if (!user) return false;
    
    const { error } = await supabase.from('crops').insert({
      ...crop,
      user_id: user.id,
    });

    if (error) {
      toast.error('Failed to add crop');
      console.error(error);
      return false;
    }
    
    toast.success('Crop added successfully');
    fetchCrops();
    return true;
  };

  const updateCrop = async (id: string, updates: Partial<CropInsert>) => {
    const { error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update crop');
      console.error(error);
      return false;
    }
    
    toast.success('Crop updated successfully');
    fetchCrops();
    return true;
  };

  const deleteCrop = async (id: string) => {
    const { error } = await supabase.from('crops').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete crop');
      console.error(error);
      return false;
    }
    
    toast.success('Crop deleted successfully');
    fetchCrops();
    return true;
  };

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  return { crops, loading, addCrop, updateCrop, deleteCrop, refetch: fetchCrops };
}

// Seed Checks Hook
export function useSeedChecks(cropId?: string) {
  const { user } = useAuth();
  const [seedChecks, setSeedChecks] = useState<SeedCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeedChecks = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('seed_checks')
      .select('*, crop:crops(*, pond:ponds(*))')
      .order('check_date', { ascending: false });

    if (cropId) {
      query = query.eq('crop_id', cropId);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to fetch seed checks');
      console.error(error);
    } else {
      setSeedChecks(data || []);
    }
    setLoading(false);
  }, [cropId]);

  const addSeedCheck = async (check: Omit<SeedCheckInsert, 'user_id'>) => {
    if (!user) return false;
    
    const { error } = await supabase.from('seed_checks').insert({
      ...check,
      user_id: user.id,
    });

    if (error) {
      toast.error('Failed to add seed check');
      console.error(error);
      return false;
    }
    
    toast.success('Seed check recorded successfully');
    fetchSeedChecks();
    return true;
  };

  const deleteSeedCheck = async (id: string) => {
    const { error } = await supabase.from('seed_checks').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete seed check');
      console.error(error);
      return false;
    }
    
    toast.success('Seed check deleted successfully');
    fetchSeedChecks();
    return true;
  };

  useEffect(() => {
    fetchSeedChecks();
  }, [fetchSeedChecks]);

  return { seedChecks, loading, addSeedCheck, deleteSeedCheck, refetch: fetchSeedChecks };
}

// Workers Hook
export function useWorkers() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error('Failed to fetch workers');
      console.error(error);
    } else {
      setWorkers(data || []);
    }
    setLoading(false);
  }, []);

  const addWorker = async (worker: Omit<WorkerInsert, 'user_id'>) => {
    if (!user) return false;
    
    const { error } = await supabase.from('workers').insert({
      ...worker,
      user_id: user.id,
    });

    if (error) {
      toast.error('Failed to add worker');
      console.error(error);
      return false;
    }
    
    toast.success('Worker added successfully');
    fetchWorkers();
    return true;
  };

  const updateWorker = async (id: string, updates: Partial<WorkerInsert>) => {
    const { error } = await supabase
      .from('workers')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update worker');
      console.error(error);
      return false;
    }
    
    toast.success('Worker updated successfully');
    fetchWorkers();
    return true;
  };

  const deleteWorker = async (id: string) => {
    const { error } = await supabase.from('workers').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete worker');
      console.error(error);
      return false;
    }
    
    toast.success('Worker deleted successfully');
    fetchWorkers();
    return true;
  };

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return { workers, loading, addWorker, updateWorker, deleteWorker, refetch: fetchWorkers };
}

// Salary Payments Hook
export function useSalaryPayments(workerId?: string) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('salary_payments')
      .select('*, worker:workers(*)')
      .order('payment_month', { ascending: false });

    if (workerId) {
      query = query.eq('worker_id', workerId);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to fetch salary payments');
      console.error(error);
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  }, [workerId]);

  const addPayment = async (payment: Omit<SalaryPaymentInsert, 'user_id'>) => {
    if (!user) return false;
    
    const { error } = await supabase.from('salary_payments').insert({
      ...payment,
      user_id: user.id,
    });

    if (error) {
      toast.error('Failed to add salary payment');
      console.error(error);
      return false;
    }
    
    toast.success('Salary payment recorded successfully');
    fetchPayments();
    return true;
  };

  const updatePayment = async (id: string, updates: Partial<SalaryPaymentInsert>) => {
    const { error } = await supabase
      .from('salary_payments')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update payment');
      console.error(error);
      return false;
    }
    
    toast.success('Payment updated successfully');
    fetchPayments();
    return true;
  };

  const deletePayment = async (id: string) => {
    const { error } = await supabase.from('salary_payments').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete payment');
      console.error(error);
      return false;
    }
    
    toast.success('Payment deleted successfully');
    fetchPayments();
    return true;
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, addPayment, updatePayment, deletePayment, refetch: fetchPayments };
}

// Notifications Hook
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  }, [user]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      fetchNotifications();
    }
  };

  const generateSeedCheckReminders = async () => {
    if (!user) return;

    // Get all active crops
    const { data: crops } = await supabase
      .from('crops')
      .select('*, pond:ponds(*)')
      .eq('status', 'active');

    if (!crops) return;

    const today = new Date();
    
    for (const crop of crops) {
      const onboardDate = new Date(crop.seed_onboard_date);
      const monthsSinceOnboard = Math.floor(
        (today.getTime() - onboardDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      // Check if we need to create a reminder (every month)
      if (monthsSinceOnboard > 0) {
        const { data: existingCheck } = await supabase
          .from('seed_checks')
          .select('id')
          .eq('crop_id', crop.id)
          .gte('check_date', new Date(today.getFullYear(), today.getMonth(), 1).toISOString())
          .limit(1);

        if (!existingCheck || existingCheck.length === 0) {
          // Create notification if no check this month
          await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'seed_check',
            title: `Seed Check Due - Pond ${crop.pond?.pond_number}`,
            message: `It's been ${monthsSinceOnboard} month(s) since ${crop.seed_type} seeds were onboarded. Time to check their size!`,
            related_id: crop.id,
            due_date: today.toISOString().split('T')[0],
          });
        }
      }
    }

    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, markAsRead, generateSeedCheckReminders, refetch: fetchNotifications };
}
