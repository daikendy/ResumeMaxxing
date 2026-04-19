export interface JobCreate {
  user_id: string;
  company_name: string;
  job_title: string;
  job_description: string;
}

export interface JobResponse extends JobCreate {
  id: number;
  status: string;
  created_at: string;
}
