export interface ResumeCreate {
  tracked_job_id: number;
  user_id: string;
  raw_resume_data: Record<string, any>;
}

export interface ResumeResponse {
  id: number;
  tracked_job_id: number;
  version_number: number;
  is_active: boolean;
  resume_content: Record<string, any>;
  created_at: string;
}
