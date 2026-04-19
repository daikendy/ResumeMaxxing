export interface MasterResumeCreate {
  user_id: string;
  resume_data: Record<string, any>;
}

export interface MasterResumeResponse {
  id: number;
  user_id: string;
  resume_data: Record<string, any>;
}
