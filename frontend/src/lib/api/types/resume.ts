export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string;
  bullets: string[];
}

export interface Project {
  title: string;
  description: string;
  technologies?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeContent {
  contact: {
    name: string;
    email: string;
    phone?: string;
    github?: string;
    linkedin?: string;
  };
  summary?: string;
  experience: Experience[];
  projects: Project[];
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    location?: string;
    gpa?: string;
  }>;
}

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
  resume_content: ResumeContent;
  created_at: string;
}
