'use client';

// Wrapper around the Axios client to call /resumes/generate
import api from '../../api';
import { ResumeResponse } from '../types/resume';
import { MasterResumeResponse } from '../types/masterResume';

// Helper to generate authorized headers
const authHeaders = (token: string) => ({
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

export const resumeService = {
  generateTailoredResume: async (data: { tracked_job_id: number; raw_resume_data: any }, token: string): Promise<ResumeResponse> => {
    const response = await api.post<ResumeResponse>('/resumes/generate', data, authHeaders(token));
    return response.data;
  },

  getMasterResume: async (token: string): Promise<MasterResumeResponse> => {
    const response = await api.get<MasterResumeResponse>('/users/master-resume', authHeaders(token));
    return response.data;
  },

  saveMasterResume: async (data: Record<string, any>, token: string): Promise<MasterResumeResponse> => {
    const payload = { resume_data: data };
    const response = await api.post<MasterResumeResponse>('/users/master-resume', payload, authHeaders(token));
    return response.data;
  },

  uploadResume: async (file: File, token: string): Promise<MasterResumeResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<MasterResumeResponse>('/users/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });
    return response.data;
  },

  getTrackedJobs: async (token: string): Promise<any[]> => {
    const response = await api.get<any[]>('/jobs/', authHeaders(token));
    return response.data;
  },

  getTrackedJob: async (jobId: string, token: string): Promise<any> => {
    const response = await api.get<any>(`/jobs/track/${jobId}`, authHeaders(token));
    return response.data;
  },

  createTrackedJob: async (data: { company_name: string; job_title: string; job_description: string }, token: string): Promise<any> => {
    const response = await api.post<any>('/jobs/', data, authHeaders(token));
    return response.data;
  }
};
