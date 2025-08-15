import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { jobService, type Job, type JobCreateData, type JobSpent, type JobSpentCreateData } from '@/services';
import { jobFail, setJobLoading, setJobs } from '@/app/(redux)/jobSlice';
import { useAppDispatch } from '@/app/(redux)/store';

interface UseJobsState {
  jobs: Job[];
  refresh: () => Promise<void>;
}

interface UseJobState {
  job: Job | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseJobSpentsState {
  spents: JobSpent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseJobActionsState {
  createUpdateJob: (formData: FormData) => Promise<Job | null>;
  deleteJob: (id: number) => Promise<boolean>;
  generateInvoice: (jobId: number) => Promise<string | null>;
  createUpdateInvoice: (jobId: number, action: string, data: { price: number; paid: number; charges: any }) => Promise<any>;
}

interface UseJobSpentActionsState {
  createUpdateSpent: (formData: FormData) => Promise<JobSpent | null>;
  deleteSpent: (id: number) => Promise<boolean>;
}

/**
 * Hook para obtener lista de jobs
 */
export const useJobs = (filters?: { status?: string; client?: number }): UseJobsState => {
  const { business } = useSelector((state: any) => state.settings);
  const { jobs } = useSelector((state: any) => state.job);
  const dispatch = useAppDispatch();

  const businessName = business?.name;

  const fetchJobs = useCallback(async () => {
    if (!businessName) {
      dispatch(jobFail('No business selected'));
      return;
    }

    try {
      dispatch(setJobLoading(true));
      const data = await jobService.getJobs(businessName, filters);
      dispatch(setJobs(data));
    } catch (err: any) {
      dispatch(jobFail(err.message || 'Error loading jobs'));
    }
  }, [businessName, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    refresh: fetchJobs,
  };
};

/**
 * Hook para obtener un job específico
 */
export const useJob = (id: number | null): UseJobState => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await jobService.getJob(id);
      setJob(data);
    } catch (err: any) {
      setError(err.message || 'Error loading job');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return {
    job,
    loading,
    error,
    refresh: fetchJob,
  };
};

/**
 * Hook para obtener gastos de un job
 */
export const useJobSpents = (jobId: number | null): UseJobSpentsState => {
  const [spents, setSpents] = useState<JobSpent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpents = useCallback(async () => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await jobService.getJobSpents(jobId);
      setSpents(data);
    } catch (err: any) {
      setError(err.message || 'Error loading job spents');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchSpents();
  }, [fetchSpents]);

  return {
    spents,
    loading,
    error,
    refresh: fetchSpents,
  };
};

/**
 * Hook para obtener invoice de un job
 */
export const useJobInvoice = (jobId: number | null): { invoice: any; charges: any; loading: boolean; error: string | null; refresh: () => Promise<void> } => {
  const [invoice, setInvoice] = useState<any>(null);
  const [charges, setCharges] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await jobService.getInvoice(jobId);
      setInvoice(data.invoice);
      setCharges(data.charges);
    } catch (err: any) {
      setError(err.message || 'Error loading invoice');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return {
    invoice,
    charges,
    loading,
    error,
    refresh: fetchInvoice,
  };
};

export const useJobActions = (): UseJobActionsState => {
  const { userName } = useSelector((state: any) => state.auth);
  const { jobs } = useSelector((state: any) => state.job);
  const dispatch = useAppDispatch();

  const createUpdateJob = async (formData: FormData): Promise<Job | null> => {
    if (!userName) {
      dispatch(jobFail('User not authenticated'));
      return null;
    }

    try {
      dispatch(setJobLoading(true));
      
      const result = await jobService.createUpdateJob(formData, userName);
      const action = formData.get('action') as string;
      const id = formData.get('id') || formData.get('job_id'); 
      
      // Actualizar Redux store de manera inteligente
      if ((action === 'update' || action === 'close') && id) {
        // Update/Close: reemplazar job existente
        const updatedJobs = jobs.map((job: Job) => 
          job.id === parseInt(id as string) ? result : job
        );
        dispatch(setJobs(updatedJobs));
      } else {
        // Create: agregar nuevo job
        dispatch(setJobs([...jobs, result]));
      }
      
      return result;
    } catch (err: any) {
      const action = formData.get('action') as string;
      dispatch(jobFail(err.message || `Error ${action === 'update' ? 'updating' : action === 'close' ? 'closing' : 'creating'} job`));
      return null;
    }
  };

  const deleteJob = async (id: number): Promise<boolean> => {
    try {
      dispatch(setJobLoading(true));
      await jobService.deleteJob(id);
      
      // Actualizar Redux store
      const updatedJobs = jobs.filter((job: Job) => job.id !== id);
      dispatch(setJobs(updatedJobs));
      return true;
    } catch (err: any) {
      dispatch(jobFail(err.message || 'Error deleting job'));
      return false;
    }
  };

  const generateInvoice = async (jobId: number): Promise<string | null> => {
    try {
      dispatch(setJobLoading(true));
      const result = await jobService.generateInvoice(jobId);
      return result.invoice_url;
    } catch (err: any) {
      dispatch(jobFail(err.message || 'Error generating invoice'));
      return null;
    }
  };

  const createUpdateInvoice = async (jobId: number, action: string, data: { price: number; paid: number; charges: any }): Promise<any> => {
    try {
      const result = await jobService.createUpdateInvoice(jobId, action, data);
      return result;
    } catch (err: any) {
      dispatch(jobFail(err.message || 'Error creating invoice'));
      return null;
    }
  };

  return {
    createUpdateJob,
    deleteJob,
    generateInvoice,
    createUpdateInvoice,
  };
};

/**
 * Hook para acciones de job spents (crear, actualizar, eliminar)
 */
export const useJobSpentActions = (): UseJobSpentActionsState => {
  const dispatch = useAppDispatch();

  const createUpdateSpent = async (formData: FormData): Promise<JobSpent | null> => {
    try {
      dispatch(setJobLoading(true));
      const result = await jobService.createUpdateJobSpent(formData);
      return result;
    } catch (err: any) {
      const action = formData.get('action') as string;
      dispatch(jobFail(err.message || `Error ${action === 'update' ? 'updating' : 'creating'} spent`));
      return null;
    }
  };

  const deleteSpent = async (id: number): Promise<boolean> => {
    try {
      dispatch(setJobLoading(true));
      const formData = new FormData();
      formData.append('action', 'delete');
      formData.append('id', id.toString());
      await jobService.deleteJobSpent(formData);
      return true;
    } catch (err: any) {
      dispatch(jobFail(err.message || 'Error deleting spent'));
      return false;
    }
  };

  return {
    createUpdateSpent,
    deleteSpent,
  };
};
