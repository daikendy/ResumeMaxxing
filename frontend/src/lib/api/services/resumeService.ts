'use client';

// Wrapper around the Axios client to call /resumes/generate
import api from '../../api';
import { ResumeVersion, MasterProfile, TrackedJob, UserProfile, ResumeContent, VaultSnapshot, ActivityLog } from '@/types/resume';

// Helper to generate authorized headers
const authHeaders = (token: string) => ({
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

export const resumeService = {
  generateTailoredResume: async (data: { tracked_job_id: number; raw_resume_data: ResumeContent }, token: string): Promise<ResumeVersion> => {
    const response = await api.post<ResumeVersion>('/resumes/generate', data, authHeaders(token));
    return response.data;
  },

  getMasterResume: async (token: string): Promise<MasterProfile | null> => {
    const response = await api.get<MasterProfile | null>('/users/master-resume', authHeaders(token));
    return response.data;
  },

  saveMasterResume: async (data: ResumeContent, token: string): Promise<MasterProfile> => {
    const payload = { resume_data: data };
    const response = await api.post<MasterProfile>('/users/master-resume', payload, authHeaders(token));
    return response.data;
  },

  uploadResume: async (file: File, token: string): Promise<MasterProfile> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<MasterProfile>('/users/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.data;
  },

  getTrackedJobs: async (token: string): Promise<TrackedJob[]> => {
    const response = await api.get<TrackedJob[]>('/jobs/', authHeaders(token));
    return response.data;
  },

  getTrackedJob: async (jobId: string, token: string): Promise<TrackedJob> => {
    const response = await api.get<TrackedJob>(`/jobs/track/${jobId}`, authHeaders(token));
    return response.data;
  },

  createTrackedJob: async (data: { company_name: string; job_title: string; job_description: string }, token: string): Promise<TrackedJob> => {
    const response = await api.post<TrackedJob>('/jobs/', data, authHeaders(token));
    return response.data;
  },

  deleteTrackedJob: async (jobId: number, token: string): Promise<void> => {
    await api.delete(`/jobs/${jobId}`, authHeaders(token));
  },

  updateTrackedJob: async (jobId: number, data: { status?: string; job_url?: string; job_title?: string; company_name?: string }, token: string): Promise<TrackedJob> => {
    const response = await api.patch<TrackedJob>(`/jobs/${jobId}`, data, authHeaders(token));
    return response.data;
  },

  getUserProfile: async (token: string): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/me', authHeaders(token));
    return response.data;
  },

  redeemReferralCode: async (code: string, token: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/users/redeem-code', { code }, authHeaders(token));
    return response.data;
  },

  // --- VAULT & TELEMETRY ---
  getActivityTelemetry: async (token: string): Promise<ActivityLog[]> => {
    const response = await api.get<ActivityLog[]>(`/users/activity?_t=${Date.now()}`, authHeaders(token));
    return response.data;
  },

  getVaultSnapshots: async (token: string): Promise<VaultSnapshot[]> => {
    const response = await api.get<VaultSnapshot[]>(`/users/vault?_t=${Date.now()}`, authHeaders(token));
    return response.data;
  },

  createVaultSnapshot: async (token: string): Promise<VaultSnapshot> => {
    const response = await api.post<VaultSnapshot>('/users/vault/snapshot', {}, authHeaders(token));
    return response.data;
  },

  restoreVaultSnapshot: async (snapshotId: number, token: string): Promise<{ status: string; name: string }> => {
    const response = await api.post<{ status: string; name: string }>('/users/vault/restore', { snapshot_id: snapshotId }, authHeaders(token));
    return response.data;
  },
  
  deleteVaultSnapshot: async (snapshotId: number, token: string): Promise<{ status: string }> => {
    const response = await api.delete<{ status: string }>(`/users/vault/${snapshotId}`, authHeaders(token));
    return response.data;
  },

  purgeVault: async (token: string): Promise<{ status: string; erased_count: number }> => {
    const response = await api.delete<{ status: string; erased_count: number }>('/users/vault/purge', authHeaders(token));
    return response.data;
  }
};
