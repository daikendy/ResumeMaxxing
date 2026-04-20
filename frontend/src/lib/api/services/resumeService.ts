// Wrapper around the Axios client to call /resumes/generate
import api from '../../api';
import { ResumeCreate, ResumeResponse } from '../types/resume';
import { MasterResumeCreate, MasterResumeResponse } from '../types/masterResume';

export const resumeService = {
  generateTailoredResume: async (data: ResumeCreate): Promise<ResumeResponse> => {
    const response = await api.post<ResumeResponse>('/resumes/generate', data);
    return response.data;
  },

  getMasterResume: async (userId: string): Promise<MasterResumeResponse> => {
    const response = await api.get<MasterResumeResponse>(`/users/${userId}/master-resume`);
    return response.data;
  },

  saveMasterResume: async (userId: string, data: Record<string, any>): Promise<MasterResumeResponse> => {
    const payload: MasterResumeCreate = { user_id: userId, resume_data: data };
    const response = await api.post<MasterResumeResponse>(`/users/${userId}/master-resume`, payload);
    return response.data;
  },

  uploadResume: async (userId: string, file: File): Promise<MasterResumeResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<MasterResumeResponse>(`/users/${userId}/upload-resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getTrackedJobs: async (userId: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/jobs/${userId}`);
    return response.data;
  },

  getTrackedJob: async (jobId: string): Promise<any> => {
    const response = await api.get<any>(`/jobs/track/${jobId}`);
    return response.data;
  },

  createTrackedJob: async (data: { user_id: string; company_name: string; job_title: string; job_description: string }): Promise<any> => {
    const response = await api.post<any>('/jobs/', data);
    return response.data;
  }
};
