// Wrapper around the Axios client to call /resumes/generate
import api from '../../api';
import { ResumeCreate, ResumeResponse } from '../types/resume';

export const resumeService = {
  generateTailoredResume: async (data: ResumeCreate): Promise<ResumeResponse> => {
    const response = await api.post<ResumeResponse>('/resumes/generate', data);
    return response.data;
  }
};
