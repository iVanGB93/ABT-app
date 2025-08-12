import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { jobService, type Job, type JobCreateData, type JobUpdateData, type JobSpent, type JobSpentCreateData } from '@/services';

interface UseJobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
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
  loading: boolean;
  error: string | null;
  createJob: (data: JobCreateData) => Promise<Job | null>;
  createJobWithFormData: (formData: FormData) => Promise<Job | null>;
  updateJob: (data: JobUpdateData) => Promise<Job | null>;
  updateJobWithFormData: (formData: FormData) => Promise<Job | null>;
  deleteJob: (id: number) => Promise<boolean>;
  createSpent: (data: JobSpentCreateData) => Promise<JobSpent | null>;
  createSpentWithFormData: (formData: FormData) => Promise<JobSpent | null>;
  updateSpent: (id: number, data: Partial<JobSpentCreateData>) => Promise<JobSpent | null>;
  deleteSpent: (id: number) => Promise<boolean>;
  generateInvoice: (jobId: number) => Promise<string | null>;
  createInvoice: (jobId: number, data: { price: number; paid: number; charges: any }) => Promise<any>;
  updateInvoice: (jobId: number, data: { price: number; paid: number; charges: any }) => Promise<any>;
}

/**
 * Hook para obtener lista de jobs
 */
export const useJobs = (filters?: { status?: string; client?: number }): UseJobsState => {
  const { business } = useSelector((state: any) => state.settings);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const businessName = business?.name;

  const fetchJobs = useCallback(async () => {
    if (!businessName) {
      setLoading(false);
      setError('No business selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await jobService.getJobs(businessName, filters);
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Error loading jobs');
    } finally {
      setLoading(false);
    }
  }, [businessName, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = async (data: JobCreateData): Promise<Job | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobService.createJob(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating job');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createJobWithFormData = async (formData: FormData): Promise<Job | null> => {
    if (!userName) {
      setError('User not authenticated');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await jobService.createJobWithFormData(formData, userName);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating job');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (data: JobUpdateData): Promise<Job | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobService.updateJob(data.id, data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating job');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateJobWithFormData = async (formData: FormData): Promise<Job | null> => {
    if (!userName) {
      setError('User not authenticated');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await jobService.updateJobWithFormData(formData, userName);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating job');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await jobService.deleteJob(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error deleting job');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createSpent = async (data: JobSpentCreateData): Promise<JobSpent | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobService.createJobSpent(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating spent');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSpentWithFormData = async (formData: FormData): Promise<JobSpent | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobService.createJobSpentWithFormData(formData);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating spent');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSpent = async (id: number, data: Partial<JobSpentCreateData>): Promise<JobSpent | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobService.updateJobSpent(id, data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating spent');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSpent = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await jobService.deleteJobSpent(id);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error deleting spent');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async (jobId: number): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobService.generateInvoice(jobId);
      return result.invoice_url;
    } catch (err: any) {
      setError(err.message || 'Error generating invoice');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (jobId: number, data: { price: number; paid: number; charges: any }): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobService.createInvoice(jobId, data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error creating invoice');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (jobId: number, data: { price: number; paid: number; charges: any }): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobService.updateInvoice(jobId, data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error updating invoice');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createJob,
    createJobWithFormData,
    updateJob,
    updateJobWithFormData,
    deleteJob,
    createSpent,
    createSpentWithFormData,
    updateSpent,
    deleteSpent,
    generateInvoice,
    createInvoice,
    updateInvoice,
  };
};
